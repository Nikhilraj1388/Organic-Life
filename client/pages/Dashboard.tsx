import { useAuth } from "../contexts/AuthContext";
import { getAuthToken } from "../lib/utils";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Edit, MapPin, ShoppingBag, Package, User, Home, Store, BarChart3, Tag } from "lucide-react";
import { Order } from "../types";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { profile, updatePersonalDetails, uploadAvatar, removeAvatar } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tabValue, setTabValue] = useState("profile");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Only redirect farmers if they're not coming from farmer-dashboard
    // Allow farmers to view their profile
  }, [user, navigate]);

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
  const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/orders/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return null;
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const personalDetails = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
      gender: (formData.get("gender") as string) || undefined,
    };

    if (!personalDetails.firstName || !personalDetails.lastName) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your first and last name.",
        variant: "destructive",
      });
      return;
    }

    updatePersonalDetails(personalDetails);
    setIsEditOpen(false);
    toast({
      title: "Saved",
      description: "Personal details updated.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-acme text-organic-brown mb-6">
          Welcome, {user.name || user.phone || "User"}!
        </h1>

        {/* Show back button for farmers */}
        {user.role === 'farmer' && (
          <Button onClick={() => navigate("/farmer-dashboard")} variant="outline" className="mb-4">
            ← Back to Seller Dashboard
          </Button>
        )}

        <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="text-organic-brown">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-organic-brown">
              <ShoppingBag className="w-4 h-4 mr-2" />
              My Orders
            </TabsTrigger>
            <TabsTrigger value="address" className="text-organic-brown">
              <Home className="w-4 h-4 mr-2" />
              Address
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column: avatar and quick actions */}
              <aside className="md:w-1/3">
                <div className="flex flex-col items-center bg-organic-cream border border-organic-brown rounded-lg p-6">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-organic-brown overflow-hidden flex items-center justify-center mb-4 relative">
                    {/* avatar placeholder */}
                    {profile.personalDetails?.firstName ||
                    profile.personalDetails?.lastName ? (
                      <div className="text-organic-brown font-acme text-2xl">
                        {(profile.personalDetails?.firstName?.[0] || "") +
                          (profile.personalDetails?.lastName?.[0] || "")}
                      </div>
                    ) : (
                      <svg
                        className="w-16 h-16 text-organic-brown opacity-80"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z"
                          fill="#79C267"
                        />
                        <path
                          d="M2 22c0-3.3 4.7-6 10-6s10 2.7 10 6v0H2z"
                          fill="#9FD3E6"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1 rounded-md bg-white border border-organic-brown text-sm text-organic-brown hover:bg-organic-cream">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) await uploadAvatar(f);
                        }}
                      />
                    </label>
                    {profile.avatarUrl && (
                      <button
                        onClick={async () => {
                          await removeAvatar();
                        }}
                        className="px-3 py-1 rounded-md bg-white border border-red-300 text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-organic-brown mb-1">
                    {profile.personalDetails?.firstName}{" "}
                    {profile.personalDetails?.lastName}
                  </h3>
                  <p className="text-sm text-organic-brown/80 mb-4 text-center">
                    {user.email || user.phone || "No contact set"}
                  </p>
                  <div className="w-full space-y-3">
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-organic-brown hover:bg-organic-black text-white flex items-center justify-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              defaultValue={profile.personalDetails?.firstName || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              defaultValue={profile.personalDetails?.lastName || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              name="dateOfBirth"
                              type="date"
                              defaultValue={profile.personalDetails?.dateOfBirth || ""}
                            />
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <select
                              id="gender"
                              name="gender"
                              defaultValue={profile.personalDetails?.gender || ""}
                              className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="submit" className="bg-organic-brown hover:bg-organic-black text-white">
                              Save
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => navigate("/address-management")} variant="outline" className="w-full flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Manage Address
                    </Button>
                    <Button onClick={() => navigate("/order-history")} variant="outline" className="w-full flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Order History
                    </Button>
                    <Button onClick={() => navigate("/marketplace")} variant="outline" className="w-full">
                      Go to Marketplace
                    </Button>
                    <Button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      variant="destructive"
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Right column: simplified profile summary */}
              <main className="md:w-2/3 bg-white rounded-lg p-6 shadow">
                <h2 className="text-2xl font-semibold mb-4 text-organic-brown">Your Profile</h2>
                <div className="space-y-3 text-organic-brown">
                  <p>
                    <strong>Name:</strong> {profile.personalDetails?.firstName} {profile.personalDetails?.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email || "Not provided"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phone || "Not provided"}
                  </p>
                  {user.role === 'farmer' && (
                    <>
                      <p>
                        <strong>Role:</strong> Farmer (Seller)
                      </p>
                      <p>
                        <strong>Farm Name:</strong> {(user as any).farmName || "Not provided"}
                      </p>
                      <p>
                        <strong>Farm Location:</strong> {(user as any).farmLocation || "Not provided"}
                      </p>
                    </>
                  )}
                  <p>
                    <strong>Date of Birth:</strong> {profile.personalDetails?.dateOfBirth || "Not provided"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {profile.personalDetails?.gender || "Not provided"}
                  </p>
                </div>
              </main>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-organic-brown flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              My Orders
            </h2>
            {ordersLoading ? (
              <p>Loading orders...</p>
            ) : ordersError ? (
              <p className="text-red-600">Failed to load orders.</p>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <Card key={order._id} className="border border-organic-brown">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-organic-brown">
                            Order #{order._id.slice(-8)}
                          </CardTitle>
                          <p className="text-sm text-organic-brown/70">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-organic-brown">
                            ${order.total.toFixed(2)}
                          </p>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
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
                                ${(item.price * item.qty).toFixed(2)}
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
              <p>No recent orders found.</p>
            )}
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-organic-brown flex items-center gap-2">
              <Home className="w-6 h-6" />
              Current Address
            </h2>
            {profile.address ? (
              <div className="text-organic-brown space-y-2">
                <p>{profile.address.street}</p>
                <p>
                  {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                </p>
                <p>{profile.address.country}</p>
              </div>
            ) : (
              <p>No address set. Please add your address in the profile settings.</p>
            )}
            <Button onClick={() => navigate("/address-management")} variant="outline" className="mt-4">
              Manage Address
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
