import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [step, setStep] = useState<"phone" | "otp" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const validatePhone = (p: string) => /^\d{10}$/.test(p.replace(/\s+/g, ""));

  const sendOtp = () => {
    if (!phone) { toast.error("Enter your phone number"); return; }
    if (!validatePhone(phone)) { toast.error("Phone number must be exactly 10 digits"); return; }
    toast.success("OTP sent to " + phone + " (use 1234)");
    setStep("otp");
  };

  const verifyOtp = () => {
    if (otp === "1234") {
      toast.success("OTP verified!");
      setStep("reset");
    } else {
      toast.error("Invalid OTP. Try 1234");
    }
  };

  const validatePassword = (p: string) => {
    const hasUpper = /[A-Z]/.test(p);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
    const digitCount = (p.match(/\d/g) || []).length;
    return hasUpper && hasSpecial && digitCount >= 3;
  };

  const resetPassword = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error("Password needs: 1 uppercase, 1 special char, 3+ numbers");
      return;
    }
    toast.success("Password changed successfully! Please login.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">PowerPulse</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {step === "phone" && "Enter your phone number to reset password"}
            {step === "otp" && "Enter the OTP sent to your phone"}
            {step === "reset" && "Set your new password"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {step === "phone" && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground">Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" maxLength={10} className="mt-1 bg-secondary border-border" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Exactly 10 digits</p>
              </div>
              <Button onClick={sendOtp} className="w-full gradient-primary text-primary-foreground">Send OTP</Button>
            </>
          )}
          {step === "otp" && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground">Enter OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="1234" maxLength={4} className="mt-1 bg-secondary border-border text-center text-2xl tracking-widest" />
              </div>
              <Button onClick={verifyOtp} className="w-full gradient-primary text-primary-foreground">Verify OTP</Button>
              <button onClick={() => setStep("phone")} className="text-xs text-muted-foreground hover:text-primary w-full text-center">Resend OTP</button>
            </>
          )}
          {step === "reset" && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground">New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-secondary border-border" />
              </div>
              <Button onClick={resetPassword} className="w-full gradient-primary text-primary-foreground">Change Password</Button>
            </>
          )}
        </div>

        <button onClick={() => navigate("/login")} className="flex items-center gap-1 mx-auto mt-4 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to Login
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
