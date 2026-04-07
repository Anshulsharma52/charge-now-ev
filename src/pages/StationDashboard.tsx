import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, IndianRupee, ListChecks, Hourglass, BatteryCharging, Zap, Building2, Mail, Phone, Car, Calendar, Send } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockBookings, mockEVOwners, type Booking } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const StationDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  const stationApproved = localStorage.getItem("pp_station_approved") === "true";
  const stationRequested = localStorage.getItem("pp_station_requested") === "true";

  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [acPrice, setAcPrice] = useState("12");
  const [dcPrice, setDcPrice] = useState("18");

  const [stationName, setStationName] = useState("");
  const [stationAddress, setStationAddress] = useState("");
  const [stationCity, setStationCity] = useState("");
  const [stationSlots, setStationSlots] = useState("4");

  const pending = bookings.filter((b) => b.status === "pending");
  const approved = bookings.filter((b) => b.status === "approved");
  const completed = bookings.filter((b) => b.status === "completed");
  const rejected = bookings.filter((b) => b.status === "cancelled");
  const totalRevenue = completed.reduce((s, b) => s + b.amount, 0);

  const updateStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Booking ${status}!`);
  };

  const submitStationRequest = () => {
    if (!stationName || !stationAddress || !stationCity) {
      toast.error("Please fill all fields");
      return;
    }
    localStorage.setItem("pp_station_requested", "true");
    localStorage.setItem("pp_station_data", JSON.stringify({
      name: stationName,
      address: stationAddress,
      city: stationCity,
      slots: +stationSlots,
      ownerName: user?.name,
      ownerEmail: user?.email,
      ownerPhone: user?.phone,
      status: "pending",
    }));
    toast.success("Station registration request sent to admin!");
    window.location.reload();
  };

  const savePricing = () => {
    toast.success(`Pricing updated! AC: ₹${acPrice}/kWh · DC: ₹${dcPrice}/kWh`);
  };

  // If station not yet approved, show registration/pending screen
  if (!stationApproved) {
    return (
      <DashboardLayout title="Station Registration" subtitle="Register your station to start accepting bookings">
        <div className="max-w-lg mx-auto">
          {stationRequested ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Hourglass className="h-12 w-12 text-warning mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Request Pending</h2>
                <p className="text-muted-foreground text-sm">Your station registration is under review by the admin. You'll get access once approved.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Register Your Station
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Station Name</Label>
                  <Input value={stationName} onChange={(e) => setStationName(e.target.value)} placeholder="e.g. GreenCharge Hub" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">Address</Label>
                  <Input value={stationAddress} onChange={(e) => setStationAddress(e.target.value)} placeholder="e.g. MG Road, Sector 14" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">City</Label>
                  <Input value={stationCity} onChange={(e) => setStationCity(e.target.value)} placeholder="e.g. Gurugram" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-sm">Number of Slots</Label>
                  <Input type="number" value={stationSlots} onChange={(e) => setStationSlots(e.target.value)} className="mt-1 bg-secondary border-border" />
                </div>
                <Button onClick={submitStationRequest} className="w-full gradient-primary text-primary-foreground">
                  <Send className="h-4 w-4 mr-2" /> Submit for Approval
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const BookingCard = ({ booking, showActions }: { booking: Booking; showActions?: boolean }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">{booking.userName}</div>
              <div className="text-xs text-muted-foreground">{booking.vehicleType} · {booking.chargeType} {booking.carModel && `· ${booking.carModel}`}</div>
              <div className="text-xs text-muted-foreground mt-1">{booking.date} · {booking.timeSlot} · {booking.duration}hr</div>
              <div className="text-xs text-muted-foreground">Payment: {booking.paymentMethod} · <span className={booking.paymentStatus === "paid" ? "text-success" : "text-warning"}>{booking.paymentStatus}</span></div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-primary">₹{booking.amount}</div>
              <Badge variant="outline" className={
                booking.status === "completed" ? "border-success/30 text-success" :
                booking.status === "approved" ? "border-accent/30 text-accent" :
                booking.status === "cancelled" ? "border-destructive/30 text-destructive" :
                "border-warning/30 text-warning"
              }>
                {booking.status === "cancelled" ? "rejected" : booking.status}
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => updateStatus(booking.id, "approved")} className="flex-1 gradient-primary text-primary-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "cancelled")} className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Hourglass, label: "Pending", value: pending.length, color: "text-warning" },
          { icon: ListChecks, label: "Approved", value: approved.length, color: "text-accent" },
          { icon: CheckCircle2, label: "Completed", value: completed.length, color: "text-success" },
          { icon: XCircle, label: "Rejected", value: rejected.length, color: "text-destructive" },
          { icon: IndianRupee, label: "Revenue", value: `₹${totalRevenue}`, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="font-semibold mb-3">Recent Pending Bookings</h3>
      <div className="space-y-3">
        {pending.length ? pending.slice(0, 3).map((b) => <BookingCard key={b.id} booking={b} showActions />) : <p className="text-muted-foreground text-sm py-4 text-center">No pending bookings</p>}
      </div>
    </>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      {[
        { title: "Pending", data: pending, showActions: true },
        { title: "Approved", data: approved },
        { title: "Completed", data: completed },
        { title: "Rejected", data: rejected },
      ].map((section) => (
        <div key={section.title}>
          <h3 className="font-semibold mb-3">{section.title} ({section.data.length})</h3>
          <div className="space-y-3">
            {section.data.length ? section.data.map((b) => <BookingCard key={b.id} booking={b} showActions={section.showActions} />) : <p className="text-muted-foreground text-sm py-2 text-center">No {section.title.toLowerCase()} bookings</p>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPricing = () => (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" /> Set Charging Prices (per kWh)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-secondary/50">
            <div className="flex items-center gap-2 mb-3">
              <BatteryCharging className="h-5 w-5 text-accent" />
              <span className="font-medium">AC Charging</span>
            </div>
            <Label className="text-xs text-muted-foreground">Price per kWh (₹)</Label>
            <Input type="number" value={acPrice} onChange={(e) => setAcPrice(e.target.value)} className="mt-1 bg-background border-border" />
          </div>
          <div className="p-4 rounded-xl border border-border bg-secondary/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-warning" />
              <span className="font-medium">DC Fast Charging</span>
            </div>
            <Label className="text-xs text-muted-foreground">Price per kWh (₹)</Label>
            <Input type="number" value={dcPrice} onChange={(e) => setDcPrice(e.target.value)} className="mt-1 bg-background border-border" />
          </div>
        </div>
        <Button onClick={savePricing} className="mt-4 gradient-primary text-primary-foreground">Save Pricing</Button>
      </CardContent>
    </Card>
  );

  const renderOwners = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">EV Owner Details</h2>
      {mockEVOwners.map((owner) => (
        <Card key={owner.id} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-medium">{owner.name}</div>
                <div className="text-xs text-muted-foreground">{owner.vehicleType}</div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                    <Mail className="h-3.5 w-3.5 mr-1" /> Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader><DialogTitle>{owner.name}</DialogTitle></DialogHeader>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> {owner.email}</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {owner.phone}</div>
                    <div className="flex items-center gap-2 text-sm"><Car className="h-4 w-4 text-muted-foreground" /> {owner.vehicleType}</div>
                    <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> Joined: {owner.joinedDate}</div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSettings = () => (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-base">Station Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Station management settings will appear here once connected to a backend.</p>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Station Dashboard" subtitle="Manage bookings, pricing, and track revenue">
      {currentTab === "dashboard" && renderDashboard()}
      {currentTab === "bookings" && renderBookings()}
      {currentTab === "pricing" && renderPricing()}
      {currentTab === "owners" && renderOwners()}
      {currentTab === "settings" && renderSettings()}
    </DashboardLayout>
  );
};

export default StationDashboard;
