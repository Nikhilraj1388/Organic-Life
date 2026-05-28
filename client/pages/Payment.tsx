import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useCart } from "../contexts/CartContext";
import { getAuthToken } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "../components/ui/use-toast";

export default function Payment() {
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const token = getAuthToken();
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, total } = location.state || { items: [], total: 0 };

  useEffect(() => {
    if (!items.length) {
      navigate("/checkout");
    }
  }, [items, navigate]);

  const createOrderMutation = useMutation({
    mutationFn: async (paymentData: { paymentId: string }) => {
      const orderPayload = {
        items: items.map((item: any) => ({
          productId: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        total,
        paymentId: paymentData.paymentId,
      };
      
      console.log('Creating order with payload:', JSON.stringify(orderPayload, null, 2));
      
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error("Failed to create order");
      }
      
      const result = await response.json();
      console.log('Order created successfully:', result);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Payment successful!", description: "Your order has been placed." });
      clearCart();
      navigate("/order-history");
    },
    onError: () => {
      toast({ title: "Order creation failed", description: "Please contact support.", variant: "destructive" });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate a 2-second payment processing delay
    setTimeout(() => {
      const mockPaymentId = `mock_pi_${Date.now()}`;
      createOrderMutation.mutate({ paymentId: mockPaymentId });
    }, 2000);
  };

  if (!items.length) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold">Total: ₹{total.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Items: {items.length}</p>
          </div>
          <Button
            onClick={handlePayment}
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing Payment..." : "Pay with Razorpay (Mock)"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/checkout")} className="w-full">
            Back to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
