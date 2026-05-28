import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Declare Google types
declare global {
  interface Window {
    google: any;
  }
}

export default function AddressSetup() {
  const { user } = useAuth();
  const { updateAddress, completeProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const streetInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Google Places Autocomplete when component mounts
    if (window.google && window.google.maps && window.google.maps.places && streetInputRef.current) {
      const options = {
        componentRestrictions: { country: "in" }, // Restrict to India
        fields: ["address_components", "formatted_address", "geometry"],
        types: ["address"], // Only show addresses, not businesses
      };

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        streetInputRef.current,
        options
      );

      // Listen for place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (place.address_components) {
          const components = place.address_components;

          // Extract address components
          let streetNumber = "";
          let streetName = "";
          let city = "";
          let state = "";
          let zipCode = "";
          let country = "India";

          components.forEach((component: any) => {
            const types = component.types;

            if (types.includes("street_number")) {
              streetNumber = component.long_name;
            }
            if (types.includes("route")) {
              streetName = component.long_name;
            }
            if (types.includes("locality") || types.includes("administrative_area_level_3")) {
              city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
              state = component.long_name;
            }
            if (types.includes("postal_code")) {
              zipCode = component.long_name;
            }
            if (types.includes("country")) {
              country = component.long_name;
            }
          });

          const fullStreet = `${streetNumber} ${streetName}`.trim();

          setAddress({
            street: fullStreet,
            city,
            state,
            zipCode,
            country,
          });
        }
      });
    }

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode ||
      !address.country
    ) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all address fields.",
        variant: "destructive",
      });
      return;
    }

    updateAddress(address);
    completeProfile();
    toast({
      title: "Profile completed!",
      description: "Welcome to Organic Life!",
    });
    navigate("/marketplace");
  };

  const handleSkip = () => {
    completeProfile();
    navigate("/marketplace");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-acme text-organic-brown">
            Add Your Address
          </CardTitle>
          <CardDescription>
            Help us deliver fresh products to your door
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                ref={streetInputRef}
                id="street"
                name="street"
                placeholder="Start typing your address..."
                value={address.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Autocomplete enabled for Indian addresses
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Mumbai"
                  value={address.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Maharashtra"
                  value={address.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">PIN Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="400001"
                  value={address.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={address.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                  disabled
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-organic-brown hover:bg-organic-black text-white"
              >
                Save Address
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
