import { motion } from "framer-motion";
import { Zap, Battery, BatteryCharging } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/15 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[180px]" />

      {/* EV Charging illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-2 border-dashed border-primary/30"
        />
        {/* Inner charging icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center glow-primary"
          >
            <BatteryCharging className="h-10 w-10 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Orbiting particles */}
        {[0, 120, 240].map((deg, i) => (
          <motion.div
            key={i}
            animate={{ rotate: [deg, deg + 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
            className="absolute inset-0"
            style={{ transformOrigin: "center" }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <Zap className="h-3 w-3 text-primary" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-gradient">PowerPulse</span>
        </div>
        <p className="text-sm text-muted-foreground">Powering India's EV Revolution</p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 gradient-primary rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
