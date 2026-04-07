import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, User, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/lib/auth-context";

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "owner", label: "EV Owner", icon: User, desc: "Book charging slots" },
  { value: "station", label: "Station Owner", icon: Building2, desc: "Manage your station" },
];

const ADMIN_CODE = "admin@powerpulse";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateInput = () => {
    const cleaned = emailOrPhone.replace(/\s+/g, "");
    if (cleaned.includes("@")) {
      if (!cleaned.includes(".com")) { return "Email must contain @ and .com"; }
    } else {
      if (!/^\d{10}$/.test(cleaned)) { return "Phone number must be exactly 10 digits"; }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) return;
    // Secret admin access — skip validation
    if (emailOrPhone.trim().toLowerCase() === ADMIN_CODE) {
      login(emailOrPhone, password, "admin");
      navigate("/admin");
      return;
    }
    const err = validateInput();
    if (err) { import("sonner").then(m => m.toast.error(err)); return; }
    login(emailOrPhone, password, selectedRole);
    if (selectedRole === "owner") navigate("/dashboard");
    else navigate("/station");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-accent/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">PowerPulse</span>
          </div>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedRole === r.value
                    ? "border-primary bg-primary/10 glow-primary"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <r.icon className={`h-5 w-5 mx-auto mb-1 ${selectedRole === r.value ? "text-primary" : "text-muted-foreground"}`} />
                <div className={`text-xs font-medium ${selectedRole === r.value ? "text-primary" : "text-muted-foreground"}`}>
                  {r.label}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="emailOrPhone" className="text-sm text-muted-foreground">Email or Phone Number</Label>
              <Input id="emailOrPhone" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} placeholder="you@example.com or +91 98765 43210" className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-secondary border-border" />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-primary hover:underline">
                Forgot Password?
              </button>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground glow-primary">
              Sign In as {roles.find((r) => r.value === selectedRole)?.label}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            New here?{" "}
            <button onClick={() => navigate("/signup")} className="text-primary hover:underline">Create an account</button>
          </p>
        </div>

        <button onClick={() => navigate("/")} className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
