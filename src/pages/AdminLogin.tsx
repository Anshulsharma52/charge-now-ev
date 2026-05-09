import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      import("sonner").then(m => m.toast.error("Please enter both email and password"));
      return;
    }

    try {
      await login(email, password, "admin");
      navigate("/admin");
    } catch (err: any) {
      import("sonner").then(m => m.toast.error(err.response?.data?.message || "Admin login failed"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-orange-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-10 w-10 text-red-500" />
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
              Admin Portal
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Secure access for system administrators</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-red-900/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Administrator Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@example.com" 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="mt-1.5" 
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium">
              Access Dashboard
            </Button>
          </form>
        </div>

        <button onClick={() => navigate("/")} className="block mx-auto mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Return to public site
        </button>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
