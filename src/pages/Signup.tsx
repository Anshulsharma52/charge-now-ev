import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, User, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/lib/auth-context";
import { toast } from "sonner";

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "evowner", label: "EV Owner", icon: User, desc: "Book charging slots" },
  { value: "station", label: "Station Owner", icon: Building2, desc: "Manage your station" },
];

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("evowner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validatePhone = (p: string) => /^\d{10}$/.test(p.replace(/\s+/g, ""));
  const validatePassword = (p: string) => {
    const hasUpper = /[A-Z]/.test(p);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
    const digitCount = (p.match(/\d/g) || []).length;
    return hasUpper && hasSpecial && digitCount >= 3;
  };
  const validateEmail = (e: string) => !e || (e.includes("@") && e.includes(".com"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!validatePhone(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    if (email && !validateEmail(email)) {
      toast.error("Email must contain @ and .com");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password needs: 1 uppercase, 1 special character, and at least 3 numbers");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    try {
      await signup(name, email, phone, password, selectedRole);
      toast.success("Account created successfully!");
      if (selectedRole === "evowner" || selectedRole === "owner") navigate("/dashboard");
      else navigate("/station");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create account");
    }
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
          <p className="text-muted-foreground text-sm">Create your free account</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-xs text-muted-foreground mb-2">I am a...</p>
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm text-muted-foreground">Full Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="s-email" className="text-sm text-muted-foreground">Email (optional)</Label>
              <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number *</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" maxLength={10} className="mt-1 bg-secondary border-border" />
              <p className="text-[10px] text-muted-foreground mt-0.5">Exactly 10 digits</p>
            </div>
            <div>
              <Label htmlFor="s-password" className="text-sm text-muted-foreground">Password *</Label>
              <Input id="s-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-secondary border-border" />
              <p className="text-[10px] text-muted-foreground mt-0.5">1 uppercase, 1 special char, 3+ numbers</p>
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-sm text-muted-foreground">Confirm Password *</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-secondary border-border" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground glow-primary">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-primary hover:underline">Sign In</button>
          </p>
        </div>

        <button onClick={() => navigate("/")} className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
};

export default Signup;
