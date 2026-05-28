import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: "personal", title: "Personal Details", required: true },
  { id: "preferences", title: "Preferences", required: false },
  { id: "address", title: "Address", required: false },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const {
    profile,
    currentStep,
    updatePersonalDetails,
    updatePreferences,
    updateAddress,
    setCurrentStep,
    skipStep,
    completeProfile,
  } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(
    steps[currentStep]?.id || "personal",
  );

  if (!user) {
    navigate("/login");
    return null;
  }

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
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
    setCurrentStep(1);
    setActiveTab("preferences");
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const preferences = {
      dietaryRestrictions: Array.from(
        formData.getAll("dietaryRestrictions"),
      ) as string[],
      notifications: formData.get("notifications") === "on",
      newsletter: formData.get("newsletter") === "on",
    };

    updatePreferences(preferences);
    setCurrentStep(2);
    setActiveTab("address");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const address = {
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      country: formData.get("country") as string,
    };

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

  const handleSkip = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    if (stepIndex >= 0) {
      skipStep(stepIndex);
      const nextStep = steps[stepIndex + 1];
      if (nextStep) {
        setActiveTab(nextStep.id);
      } else {
        completeProfile();
        navigate("/marketplace");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-acme text-organic-brown">
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Help us personalize your Organic Life experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                {steps.map((step, index) => (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    disabled={
                      index > currentStep &&
                      steps
                        .slice(0, index)
                        .some(
                          (s) =>
                            s.required &&
                            !profile[s.id as keyof typeof profile],
                        )
                    }
                  >
                    {step.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <form onSubmit={handlePersonalSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <Select
                      name="gender"
                      defaultValue={profile.personalDetails?.gender || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-organic-brown hover:bg-organic-black text-white"
                    >
                      Next
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                  <div>
                    <Label>Dietary Restrictions</Label>
                    <div className="space-y-2 mt-2">
                      {[
                        "Vegetarian",
                        "Vegan",
                        "Gluten-Free",
                        "Dairy-Free",
                        "Nut-Free",
                      ].map((restriction) => (
                        <div
                          key={restriction}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={restriction}
                            name="dietaryRestrictions"
                            value={restriction}
                            defaultChecked={profile.preferences?.dietaryRestrictions.includes(
                              restriction,
                            )}
                          />
                          <Label htmlFor={restriction}>{restriction}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifications"
                        name="notifications"
                        defaultChecked={profile.preferences?.notifications}
                      />
                      <Label htmlFor="notifications">
                        Receive order notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        name="newsletter"
                        defaultChecked={profile.preferences?.newsletter}
                      />
                      <Label htmlFor="newsletter">
                        Subscribe to newsletter
                      </Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-organic-brown hover:bg-organic-black text-white"
                    >
                      Next
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSkip("preferences")}
                    >
                      Skip
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <form onSubmit={handleAddressSubmit} className="space-y-4">
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
                        defaultValue={
                          profile.address?.country || "United States"
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-organic-brown hover:bg-organic-black text-white"
                    >
                      Complete Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSkip("address")}
                    >
                      Skip
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
