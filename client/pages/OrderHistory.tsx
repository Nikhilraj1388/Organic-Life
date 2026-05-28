import { useAuth } from "../contexts/AuthContext";
import { getAuthToken } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag, Package } from "lucide-react";
import { Order } from "../types";

export default function OrderHistory() {
  const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
  const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/orders/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        // If 404, treat as no orders instead of error
        if (response.status === 404) {
          return [];
        }
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
    enabled: !!user.id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-acme text-organic-brown flex items-center gap-2">
            <ShoppingBag className="w-8 h-8" />
            Order History
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-brown mx-auto"></div>
            <p className="mt-4 text-organic-brown">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load orders. Please try again later.</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="border border-organic-brown">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-organic-brown">
                        Order #{order._id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-organic-brown/70">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-organic-brown">
                        {inrFormatter.format(order.total)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-organic-brown flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items ({order.items.length})
                    </h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-organic-brown">
                            {item.name} × {item.qty}
                          </span>
                          <span className="text-organic-brown font-medium">
                            {inrFormatter.format(item.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-organic-brown/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-organic-brown mb-2">No orders yet</h3>
            <p className="text-organic-brown/70 mb-6">
              You haven't placed any orders yet. Start shopping to see your order history here!
            </p>
            <Button
              onClick={() => navigate("/marketplace")}
              className="bg-organic-brown hover:bg-organic-black text-white"
            >
              Browse Marketplace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
