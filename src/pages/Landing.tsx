import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, Clock, Shield, ChevronRight, Battery, Car, BarChart3, ArrowRight, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";
import heroImage from "@/assets/hero-ev-charging.jpg";

const features = [
  { icon: Zap, title: "Instant Booking", desc: "Book your charging slot in seconds with real-time availability updates." },
  { icon: MapPin, title: "Find Nearby", desc: "Locate the nearest charging station on an interactive map with directions." },
  { icon: Clock, title: "Save Time", desc: "Pre-book your slot, arrive and charge — zero wait time, guaranteed." },
  { icon: Shield, title: "Secure Payments", desc: "UPI, Cards, Wallets — fast, secure payments with instant confirmation." },
];

const steps = [
  { num: "01", title: "Sign Up", desc: "Create your free account in under 30 seconds", icon: Car },
  { num: "02", title: "Find Station", desc: "Browse nearby stations with live slot availability", icon: MapPin },
  { num: "03", title: "Book & Pay", desc: "Choose AC/DC, pick a time, and pay securely", icon: Battery },
  { num: "04", title: "Charge Up", desc: "Arrive at your booked time and start charging instantly", icon: Zap },
];

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({ stations: "500+", bookings: "10K+", cities: "50+", uptime: "99%" });

  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats({
          stations: (data.stations > 0 ? data.stations : 500) + "+",
          bookings: (data.bookings > 0 ? data.bookings : "10K") + "+",
          cities: (data.cities > 0 ? data.cities : 50) + "+",
          uptime: data.uptime || "99%"
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-gradient">PowerPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-primary">
              Sign In
            </Button>
            <Button onClick={() => navigate("/signup")} className="gradient-primary text-primary-foreground glow-primary">
              Sign Up Free <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero with EV background */}
      <section className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="EV Charging Station" width={1920} height={1080} className="w-full h-full object-cover dark:opacity-100 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50 dark:via-background/85 dark:to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/70 dark:via-transparent dark:to-background/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Stations across India
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Charge Your EV.
              <br />
              <span className="text-gradient">Never Wait.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Real-time slot booking for EV charging stations — find, book, and charge — all in under 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate("/signup")} className="gradient-primary text-primary-foreground glow-primary text-base px-8">
                <Zap className="mr-2 h-5 w-5" /> Book a Slot
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-primary/30 text-primary hover:bg-primary/10">
                <MapPin className="mr-2 h-5 w-5" /> Find Stations
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl"
          >
            {[
              [stats.stations, "Stations"],
              [stats.bookings, "Bookings"],
              [stats.cities, "Cities"],
              [stats.uptime, "Uptime"],
            ].map(([val, label]) => (
              <div key={label} className="text-center p-4 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-border shadow-sm">
                <div className="text-3xl font-bold text-gradient">{val}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
       <section className="py-20 border-t border-border bg-muted/40 dark:bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            From sign up to charging — it takes just 4 simple steps
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center p-6"
              >
                <div className="text-5xl font-black text-primary/10 mb-2">{step.num}</div>
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-primary/30">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why <span className="text-gradient">PowerPulse</span>?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Built for India's EV revolution with features that matter
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Station Owners */}
      <section className="py-20 border-t border-border bg-muted/40 dark:bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm mb-6">
              <BarChart3 className="h-3.5 w-3.5" /> For Station Owners
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Own a Charging Station? <span className="text-gradient">List it with us</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Set your own AC/DC pricing, manage bookings, track revenue, and grow your EV charging business with PowerPulse.
            </p>
            <Button size="lg" onClick={() => navigate("/signup")} className="gradient-primary text-primary-foreground glow-primary">
              Register Your Station <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="text-gradient">Power Up</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of EV owners who charge smarter. Create your free account now.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/signup")} className="gradient-primary text-primary-foreground glow-primary px-8">
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-primary/30 text-primary hover:bg-primary/10">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>PowerPulse © 2026</span>
          </div>
          <span>Made for India's EV future 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
