import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Zap, Clock, Star, CreditCard, CheckCircle2, XCircle, BatteryCharging, Wallet, Smartphone, Mail, Phone, Building2, Banknote, Car } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mockStations, mockBookings, bookedSlots, type Booking, type Station } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const allTimeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM",
];

const durationOptions = [
  { label: "30 min", value: 0.5 },
  { label: "45 min", value: 0.75 },
  { label: "1 hour", value: 1 },
  { label: "1.5 hours", value: 1.5 },
  { label: "2 hours", value: 2 },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [duration, setDuration] = useState(1);
  const [chargeType, setChargeType] = useState<"AC" | "DC">("DC");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "Wallet" | "COD">("UPI");
  const [carModel, setCarModel] = useState("");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings.filter((b) => b.userId === "u1"));
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const activeStations = mockStations.filter((s) => s.status === "active");

  const getPrice = (station: Station) => chargeType === "AC" ? station.pricePerKWhAC : station.pricePerKWhDC;

  const getBookedSlots = (stationId: string) => bookedSlots[stationId] || [];

  const handleBook = () => {
    if (!selectedStation || !selectedSlot) return;
    const estimatedKWh = duration * (chargeType === "DC" ? 50 : 7.4);
    const price = Math.round(getPrice(selectedStation) * estimatedKWh);
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      userId: "u1",
      userName: user?.name || "User",
      userEmail: user?.email || "",
      userPhone: user?.phone || "",
      date: new Date().toISOString().split("T")[0],
      timeSlot: selectedSlot,
      duration,
      amount: price,
      status: "pending",
      vehicleType: "EV",
      carModel: carModel || undefined,
      chargeType,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
    };
    setBookings((prev) => [newBooking, ...prev]);
    toast.success(`Slot booked at ${selectedStation.name}!`);
    setSelectedStation(null);
    setSelectedSlot("");
    setCarModel("");
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const, paymentStatus: b.paymentMethod === "COD" ? "pending" as const : "refunded" as const } : b));
    toast.success("Booking cancelled!");
  };

  const submitReview = () => {
    if (!reviewBookingId) return;
    setBookings((prev) => prev.map((b) => b.id === reviewBookingId ? {
      ...b,
      review: { id: `r${Date.now()}`, userId: "u1", userName: user?.name || "User", rating: reviewRating, comment: reviewComment, date: new Date().toISOString().split("T")[0] }
    } : b));
    toast.success("Review submitted!");
    setReviewBookingId(null);
    setReviewComment("");
    setReviewRating(5);
  };

  const filteredBookings = bookingFilter === "all" ? bookings : bookings.filter((b) => b.status === bookingFilter);

  // Dashboard tab
  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Zap, label: "Available Stations", value: activeStations.length, color: "text-primary" },
          { icon: Clock, label: "My Bookings", value: bookings.length, color: "text-accent" },
          { icon: CheckCircle2, label: "Completed", value: bookings.filter((b) => b.status === "completed").length, color: "text-success" },
          { icon: CreditCard, label: "Total Spent", value: `₹${bookings.reduce((s, b) => s + b.amount, 0)}`, color: "text-warning" },
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

      <Card className="bg-card border-border mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Nearby Stations</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground text-sm">
            🗺️ Interactive map — connect a maps API to see live stations
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Stations tab
  const renderStations = () => (
    <>
      <h2 className="text-lg font-semibold mb-4">Available Stations</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeStations.map((station, i) => (
          <motion.div key={station.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{station.name}</h3>
                    <p className="text-xs text-muted-foreground">{station.address}, {station.city}</p>
                  </div>
                  <div className="flex items-center gap-1 text-warning text-sm">
                    <Star className="h-3.5 w-3.5 fill-current" /> {station.rating}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <span className={station.availableSlots > 0 ? "text-primary" : "text-destructive"}>
                    {station.availableSlots}/{station.slots} slots free
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><BatteryCharging className="h-3 w-3 text-accent" /> AC: ₹{station.pricePerKWhAC}/kWh</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-warning" /> DC: ₹{station.pricePerKWhDC}/kWh</span>
                </div>

                {/* Book Slot Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground" disabled={station.availableSlots === 0} onClick={() => { setSelectedStation(station); setSelectedSlot(""); }}>
                      {station.availableSlots > 0 ? "Book Slot" : "Full"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Book at {station.name} — {station.city}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 mt-2">
                      {/* Charging Type */}
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["AC", "DC"] as const).map((type) => (
                            <button key={type} onClick={() => setChargeType(type)}
                              className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                                chargeType === type ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                              }`}>
                              {type === "DC" ? <Zap className="h-5 w-5 text-warning" /> : <BatteryCharging className="h-5 w-5 text-accent" />}
                              <div className="text-left">
                                <div className="font-semibold text-sm">{type === "DC" ? "DC Fast" : "AC"} {type === "DC" ? "150kW" : "7.4kW"}</div>
                                <div className="text-xs text-muted-foreground">₹{type === "AC" ? station.pricePerKWhAC : station.pricePerKWhDC}/kWh</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration Chips */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Charging Duration</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {durationOptions.map((d) => (
                            <button key={d.value} onClick={() => setDuration(d.value)}
                              className={`p-2 rounded-lg border text-xs text-center transition-all ${
                                duration === d.value ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/30"
                              }`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time Slot Grid */}
                      <div>
                        <div className="text-sm font-medium mb-2">Select Time Slot</div>
                        <div className="grid grid-cols-4 gap-2">
                          {allTimeSlots.map((slot) => {
                            const isBooked = getBookedSlots(station.id).includes(slot);
                            return (
                              <button key={slot} disabled={isBooked} onClick={() => setSelectedSlot(slot)}
                                className={`p-2 rounded-lg border text-xs text-center transition-all ${
                                  isBooked ? "border-border bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50" :
                                  selectedSlot === slot ? "border-primary bg-primary/10 text-primary font-semibold" :
                                  "border-border text-foreground hover:border-primary/30"
                                }`}>
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Car Model (optional) */}
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1"><Car className="h-3.5 w-3.5" /> Car Model (optional)</label>
                        <Input value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="e.g. Tata Nexon EV Max" className="mt-1 bg-secondary border-border" />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="text-sm text-muted-foreground">Payment Method</label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {([
                            { value: "UPI" as const, icon: Smartphone, label: "UPI" },
                            { value: "Card" as const, icon: CreditCard, label: "Card" },
                            { value: "Wallet" as const, icon: Wallet, label: "Wallet" },
                            { value: "COD" as const, icon: Banknote, label: "COD" },
                          ]).map((pm) => (
                            <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                              className={`p-2 rounded-lg border text-center text-xs transition-all flex flex-col items-center gap-1 ${
                                paymentMethod === pm.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                              }`}>
                              <pm.icon className="h-4 w-4" />
                              {pm.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="p-3 rounded-lg bg-secondary text-sm">
                        Estimated: <span className="font-bold text-primary">₹{Math.round(getPrice(station) * duration * (chargeType === "DC" ? 50 : 7.4))}</span>
                        <span className="text-muted-foreground ml-2">({chargeType} · {duration}hr · ~{Math.round(duration * (chargeType === "DC" ? 50 : 7.4))}kWh)</span>
                      </div>

                      <Button onClick={handleBook} disabled={!selectedSlot} className="w-full gradient-primary text-primary-foreground">
                        Confirm Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );

  // Bookings tab
  const renderBookings = () => (
    <>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "pending", "completed", "cancelled"] as const).map((f) => (
          <Button key={f} size="sm" variant={bookingFilter === f ? "default" : "outline"} onClick={() => setBookingFilter(f)}
            className={bookingFilter === f ? "gradient-primary text-primary-foreground" : "border-border"}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length})
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredBookings.map((b) => (
          <Card key={b.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{b.stationName}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.date} · {b.timeSlot} · {b.duration}hr · {b.chargeType} {b.carModel && `· ${b.carModel}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Payment: {b.paymentMethod} · <span className={b.paymentStatus === "refunded" ? "text-warning" : b.paymentStatus === "pending" ? "text-warning" : "text-success"}>{b.paymentStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-primary">₹{b.amount}</span>
                  <Badge variant="outline" className={
                    b.status === "completed" ? "bg-success/20 text-success border-success/30" :
                    b.status === "approved" ? "bg-accent/20 text-accent border-accent/30" :
                    b.status === "cancelled" ? "bg-destructive/20 text-destructive border-destructive/30" :
                    "border-warning/30 text-warning"
                  }>{b.status}</Badge>
                  {(b.status === "pending" || b.status === "approved") && (
                    <Button size="sm" variant="outline" onClick={() => cancelBooking(b.id)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                  {b.status === "completed" && !b.review && (
                    <Button size="sm" variant="outline" onClick={() => setReviewBookingId(b.id)} className="border-warning/30 text-warning hover:bg-warning/10">
                      <Star className="h-3.5 w-3.5 mr-1" /> Review
                    </Button>
                  )}
                  {b.review && (
                    <span className="text-xs text-warning flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> {b.review.rating}/5
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredBookings.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No bookings found</p>}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewBookingId} onOpenChange={(open) => !open && setReviewBookingId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Rate Your Experience</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-muted-foreground">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setReviewRating(r)}>
                    <Star className={`h-6 w-6 ${r <= reviewRating ? "text-warning fill-current" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Comment</label>
              <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." className="mt-1 bg-secondary border-border" />
            </div>
            <Button onClick={submitReview} className="w-full gradient-primary text-primary-foreground">Submit Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  // Payments tab
  const renderPayments = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">Payment History</h2>
      {bookings.map((b) => (
        <Card key={b.id} className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{b.stationName}</div>
              <div className="text-xs text-muted-foreground">{b.date} · {b.paymentMethod}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-primary">₹{b.amount}</div>
              <Badge variant="outline" className={b.paymentStatus === "paid" ? "border-success/30 text-success" : b.paymentStatus === "refunded" ? "border-warning/30 text-warning" : "border-muted text-muted-foreground"}>
                {b.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Reviews tab
  const renderReviews = () => {
    const reviewed = bookings.filter((b) => b.review);
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-4">My Reviews</h2>
        {reviewed.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No reviews yet. Complete a booking and leave a review!</p>}
        {reviewed.map((b) => (
          <Card key={b.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="font-medium">{b.stationName}</div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Star key={r} className={`h-4 w-4 ${r <= (b.review?.rating || 0) ? "text-warning fill-current" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{b.review?.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Contact tab
  const renderContact = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">Station Contact Details</h2>
      {activeStations.map((station) => (
        <Card key={station.id} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-medium">{station.name}</div>
                <div className="text-xs text-muted-foreground">{station.address}, {station.city}</div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {station.ownerName}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {station.ownerEmail}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {station.ownerPhone}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardLayout title={`Welcome, ${user?.name || "Owner"}`} subtitle="Find and book EV charging slots">
      {currentTab === "dashboard" && renderDashboard()}
      {currentTab === "stations" && renderStations()}
      {currentTab === "bookings" && renderBookings()}
      {currentTab === "payments" && renderPayments()}
      {currentTab === "reviews" && renderReviews()}
      {currentTab === "contact" && renderContact()}
    </DashboardLayout>
  );
};

export default OwnerDashboard;
