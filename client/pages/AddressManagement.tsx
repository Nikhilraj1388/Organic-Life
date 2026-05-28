import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin } from "lucide-react";

export default function AddressManagement() {
  const { user } = useAuth();
  const { profile, updateAddress } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address = {
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      country: formData.get("country") as string,
    };

    if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all address fields.",
        variant: "destructive",
      });
      return;
    }

    updateAddress(address);
    toast({
      title: "Saved",
      description: "Address updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-acme text-organic-brown flex items-center gap-2">
            <MapPin className="w-8 h-8" />
            Address Management
          </h1>
        </div>

        <div className="space-y-6">
          <div className="bg-organic-cream border border-organic-brown rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-organic-brown">Current Address</h2>
            {profile.address ? (
              <div className="text-organic-brown space-y-1">
                <p><strong>Street:</strong> {profile.address.street}</p>
                <p><strong>City:</strong> {profile.address.city}</p>
                <p><strong>State:</strong> {profile.address.state}</p>
                <p><strong>ZIP Code:</strong> {profile.address.zipCode}</p>
                <p><strong>Country:</strong> {profile.address.country}</p>
              </div>
            ) : (
              <p className="text-organic-brown/70">No address set yet.</p>
            )}
          </div>

          <div className="bg-white border border-organic-brown rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-organic-brown">Update Address</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  name="street"
                  defaultValue={profile.address?.street || ""}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={profile.address?.city || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={profile.address?.state || ""}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={profile.address?.zipCode || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={profile.address?.country || "United States"}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="bg-organic-brown hover:bg-organic-black text-white">
                Save Address
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
