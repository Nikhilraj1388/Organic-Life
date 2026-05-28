import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"user" | "farmer">("user");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"user" | "farmer">("user");
  const [registerFarmName, setRegisterFarmName] = useState("");
  const [registerFarmLocation, setRegisterFarmLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginWithPhone, verifyOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const getRedirectPath = (role: string) => {
    if (role === "farmer") return "/farmer-dashboard";
    if (role === "admin") return "/admin";
    return "/dashboard";
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Login successful", description: "Welcome to Organic Life!" });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      navigate(getRedirectPath(user.role || "user"), { replace: true });
    } catch (error) {
      toast({ title: "Login failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({ title: "Fields required", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword, loginRole, true);
      toast({ title: "Login successful", description: "Welcome back!" });
      navigate(getRedirectPath(loginRole), { replace: true });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message || "Invalid credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      toast({ title: "Fields required", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (registerRole === 'farmer' && (!registerFarmName || !registerFarmLocation)) {
      toast({ title: "Farm details required", description: "Please provide farm name and location.", variant: "destructive" });
      return;
    }
    if (registerPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await registerWithEmail(registerEmail, registerPassword, registerName, registerRole, registerFarmName, registerFarmLocation, true);
      toast({ title: "Registration successful", description: "Welcome to Organic Life!" });
      navigate(getRedirectPath(registerRole), { replace: true });
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone || !phone.match(/^\+91\d{10}$/)) {
      toast({ title: "Invalid phone", description: "Enter a valid Indian phone number (+91 followed by 10 digits).", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPhone(phone, true);
      setShowOTP(true);
      setResendTimer(60);
      toast({ title: "OTP sent", description: "Check your phone for the verification code." });
    } catch (error) {
      toast({ title: "Failed to send OTP", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter a valid 6-digit code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await verifyOTP(otp);
      toast({ title: "Verification successful", description: "Welcome to Organic Life!" });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      navigate(getRedirectPath(user.role || "user"), { replace: true });
    } catch (error) {
      toast({ title: "Verification failed", description: "Invalid OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-acme text-organic-brown">Welcome to Organic Life</CardTitle>
          <CardDescription className="text-lg">Sign in to access fresh, organic products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="login-role">Login as</Label>
                <select
                  id="login-role"
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as "user" | "farmer")}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-organic-brown"
                >
                  <option value="user">Customer</option>
                  <option value="farmer">Farmer (Seller)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="h-11" />
              </div>
              <Button onClick={handleEmailLogin} disabled={isLoading} className="w-full bg-organic-brown hover:bg-organic-black text-white h-11">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center">
                <button type="button" className="text-sm text-organic-brown underline" onClick={() => navigate("/reset-password")}>
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-11">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              {!showOTP ? (
                <Button onClick={() => setShowOTP(true)} disabled={isLoading} variant="outline" className="w-full h-11">
                  Sign in with Phone OTP
                </Button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
                  </div>
                  <Button onClick={handlePhoneLogin} disabled={isLoading} className="w-full bg-organic-brown hover:bg-organic-black text-white h-11">
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                  {otp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <InputOTP id="otp" value={otp} onChange={setOtp} maxLength={6}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full bg-organic-brown hover:bg-organic-black text-white h-11">
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <Button onClick={handlePhoneLogin} disabled={resendTimer > 0 || isLoading} variant="link" className="w-full">
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setShowOTP(false)} variant="ghost" className="w-full">
                    Back to Email Login
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="register-role">Register as</Label>
                <select
                  id="register-role"
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value as "user" | "farmer")}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-organic-brown"
                >
                  <option value="user">Customer</option>
                  <option value="farmer">Farmer (Seller)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input id="register-name" type="text" placeholder="Your full name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input id="register-email" type="email" placeholder="your@email.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input id="register-password" type="password" placeholder="Choose a password (min 6 chars)" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="h-11" />
              </div>
              {registerRole === 'farmer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="register-farm-name">Farm Name</Label>
                    <Input id="register-farm-name" type="text" placeholder="Your farm name" value={registerFarmName} onChange={(e) => setRegisterFarmName(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-farm-location">Farm Location</Label>
                    <Input id="register-farm-location" type="text" placeholder="City, State" value={registerFarmLocation} onChange={(e) => setRegisterFarmLocation(e.target.value)} className="h-11" />
                  </div>
                </>
              )}
              <Button onClick={handleRegister} disabled={isLoading} className="w-full bg-organic-brown hover:bg-organic-black text-white h-11">
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-11">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
