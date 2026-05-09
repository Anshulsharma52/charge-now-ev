import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { io } from "socket.io-client";
import LoadingScreen from "@/components/LoadingScreen";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, IndianRupee, ListChecks, Hourglass, BatteryCharging, Zap, Building2, Mail, Phone, Car, Calendar, Send, Star } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Booking } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import NativeLeafletMap from "@/components/NativeLeafletMap";

const StationDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  const queryClient = useQueryClient();

  const { data: station, isLoading } = useQuery({
    queryKey: ['myStation'],
    queryFn: async () => {
      try {
        const res = await api.get('/stations/my-station');
        return res.data;
      } catch (e: any) {
        if (e.response?.status === 404) return null;
        throw e;
      }
    }
  });

  const { data: initialBookings = [] } = useQuery({
    queryKey: ['myStationBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    },
    enabled: !!station && station.status === 'active'
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  useEffect(() => { setBookings(initialBookings) }, [initialBookings]);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("new-booking", () => {
      queryClient.invalidateQueries({ queryKey: ["myStationBookings"] });
    });
    socket.on("booking-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["myStationBookings"] });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const [acPrice, setAcPrice] = useState("12");
  const [dcPrice, setDcPrice] = useState("18");

  const [stationName, setStationName] = useState("");
  const [stationAddress, setStationAddress] = useState("");
  const [stationCity, setStationCity] = useState("");
  const [stationSlots, setStationSlots] = useState("4");
  const [stationLat, setStationLat] = useState("");
  const [stationLng, setStationLng] = useState("");
  const [nextAvailableTime, setNextAvailableTime] = useState("");
  const [operatingHoursStart, setOperatingHoursStart] = useState("00:00");
  const [operatingHoursEnd, setOperatingHoursEnd] = useState("23:59");
  const [acceptsOnlinePayments, setAcceptsOnlinePayments] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  useEffect(() => {
    if (station && station.status === "active") {
      setStationName(station.name || "");
      setStationAddress(station.address || "");
      setStationCity(station.city || "");
      setStationSlots(station.slots?.toString() || "");
      setAcPrice(station.pricePerKWhAC?.toString() || "12");
      setDcPrice(station.pricePerKWhDC?.toString() || "18");
      setStationLat(station.lat?.toString() || "");
      setStationLng(station.lng?.toString() || "");
      setNextAvailableTime(station.nextAvailableTime || "");
      setOperatingHoursStart(station.operatingHoursStart || "00:00");
      setOperatingHoursEnd(station.operatingHoursEnd || "23:59");
      setAcceptsOnlinePayments(station.acceptsOnlinePayments || false);
      setUpiId(station.upiId || "");
    }
  }, [station]);

  const pending = bookings.filter((b) => b.status === "pending");
  const approved = bookings.filter((b) => b.status === "approved");
  const completed = bookings.filter((b) => b.status === "completed");
  const rejected = bookings.filter((b) => b.status === "cancelled");
  const totalRevenue = completed.reduce((s, b) => s + b.amount, 0);

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status, paymentStatus }: any) => await api.put(`/bookings/${id}`, { status, paymentStatus }),
    onSuccess: (data, variables) => {
      toast.success(`Booking ${variables.status}!`);
      queryClient.invalidateQueries({ queryKey: ["myStationBookings"] });
    }
  });

  const updateStatus = (id: string, status: Booking["status"], paymentStatus?: string) => {
    updateStatusMut.mutate({ id, status, paymentStatus });
  };

  const createStationMut = useMutation({
    mutationFn: async (data: any) => await api.post('/stations', data),
    onSuccess: () => {
      toast.success("Station registration request sent to admin!");
      queryClient.invalidateQueries({ queryKey: ["myStation"] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Failed to register station");
    }
  });

  const searchLocation = async () => {
    if (!mapSearchQuery) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setStationLat(data[0].lat);
        setStationLng(data[0].lon);
        toast.success("Location found! Map updated.");
      } else {
        toast.error("Location not found");
      }
    } catch (e) {
      toast.error("Failed to search location");
    } finally {
      setIsSearchingMap(false);
    }
  };

  const submitStationRequest = () => {
    if (!stationName || !stationAddress || !stationCity) {
      toast.error("Please fill all fields");
      return;
    }
    if (!stationLat || !stationLng) {
      toast.error("Please pin your location on the map");
      return;
    }
    
    createStationMut.mutate({
      name: stationName,
      address: stationAddress,
      city: stationCity,
      slots: +stationSlots,
      pricePerKWhAC: +acPrice,
      pricePerKWhDC: +dcPrice,
      lat: +stationLat,
      lng: +stationLng,
      acceptsOnlinePayments,
      upiId,
      status: "pending"
    });
  };

  const updateStationSettingsMut = useMutation({
    mutationFn: async (data: any) => {
      if (!station?._id) return;
      const res = await api.put(`/stations/${station._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Station updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["myStation"] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Failed to update station");
    }
  });

  const savePricing = () => {
    if (!station?._id) return;
    updateStationSettingsMut.mutate({
      pricePerKWhAC: +acPrice,
      pricePerKWhDC: +dcPrice
    });
  };

  // If station not yet approved or not created, show registration/pending screen
  if (isLoading) return <LoadingScreen />;

  if (!station || station.status !== "active") {
    return (
      <DashboardLayout title="Station Registration" subtitle="Register your station to start accepting bookings">
        <div className="max-w-lg mx-auto">
          {station && station.status === "pending" ? (
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
                <div>
                  <Label className="text-sm">Pin Station Location</Label>
                  <div className="text-xs text-muted-foreground mb-2">Search for a location or click on the map to drop a pin</div>
                  <div className="flex gap-2 mb-3">
                    <Input 
                      placeholder="Search city, address, or landmark..." 
                      value={mapSearchQuery} 
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                      className="bg-secondary border-border"
                    />
                    <Button type="button" onClick={searchLocation} disabled={isSearchingMap} variant="outline">
                      {isSearchingMap ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  <div className="h-64 rounded-xl overflow-hidden border border-border">
                    <NativeLeafletMap 
                      center={(!isNaN(parseFloat(stationLat)) && !isNaN(parseFloat(stationLng))) ? [parseFloat(stationLat), parseFloat(stationLng)] : [20.5937, 78.9629]} 
                      zoom={(!isNaN(parseFloat(stationLat)) && !isNaN(parseFloat(stationLng))) ? 13 : 4} 
                      markerPosition={(!isNaN(parseFloat(stationLat)) && !isNaN(parseFloat(stationLng))) ? [parseFloat(stationLat), parseFloat(stationLng)] : null}
                      onMapClick={(lat, lng) => { setStationLat(lat.toString()); setStationLng(lng.toString()); }}
                    />
                  </div>
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
          {(showActions || booking.status === "approved") && (
            <div className="flex gap-2 mt-3">
              {booking.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => updateStatus(booking._id || booking.id, "approved")} className="flex-1 gradient-primary text-primary-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(booking._id || booking.id, "cancelled")} className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </>
              )}
              {booking.status === "approved" && (
                <Button size="sm" onClick={() => updateStatus(booking._id || booking.id, "completed", "paid")} className="flex-1 gradient-primary text-primary-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Completed
                </Button>
              )}
            </div>
          )}
          {booking.review && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-lg text-sm border border-border">
              <div className="flex items-center gap-1 text-warning mb-1">
                {[...Array(booking.review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <div className="text-muted-foreground italic">"{booking.review.comment}"</div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const updateAvailableSlots = (diff: number) => {
    if (!station?._id) return;
    const newSlots = Math.max(0, Math.min(station.slots, (station.availableSlots || 0) + diff));
    updateStationSettingsMut.mutate({ availableSlots: newSlots });
  };

  const saveNextAvailableTime = () => {
    updateStationSettingsMut.mutate({ nextAvailableTime });
  };

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

      <Card className="bg-card border-border mb-8">
        <CardHeader><CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><BatteryCharging className="h-5 w-5 text-primary" /> Live Slot Availability</span>
          <Badge variant={station.availableSlots > 0 ? "default" : "destructive"}>{station.availableSlots > 0 ? "Available" : "Full"}</Badge>
        </CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/50">
            <div>
              <div className="font-semibold text-lg">{station.availableSlots || 0} / {station.slots}</div>
              <div className="text-xs text-muted-foreground">Slots currently available for booking</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => updateAvailableSlots(-1)} disabled={(station.availableSlots || 0) <= 0}>-1 (Mark Full)</Button>
              <Button variant="outline" size="sm" onClick={() => updateAvailableSlots(1)} disabled={(station.availableSlots || 0) >= station.slots}>+1 (Mark Free)</Button>
            </div>
          </div>
          
          {(station.availableSlots || 0) === 0 && (
            <div className="mt-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold text-destructive">Station is Full</Label>
                <div className="text-xs text-muted-foreground">Let EV owners know when slots will be free</div>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="datetime-local" 
                  value={nextAvailableTime} 
                  onChange={(e) => setNextAvailableTime(e.target.value)}
                  className="bg-background max-w-[200px]"
                />
                <Button size="sm" onClick={saveNextAvailableTime} variant="outline" className="border-primary/50 text-primary">Set Time</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

  const renderOwners = () => {
    const evOwners = allUsers.filter((u: any) => u.role === "evowner");

    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-4">EV Owner Details</h2>
        {evOwners.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No EV owners found.</p>
        ) : (
          evOwners.map((owner: any) => (
            <Card key={owner._id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{owner.name}</div>
                    <div className="text-xs text-muted-foreground">{owner.vehicleType || "EV"}</div>
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
                        <div className="flex items-center gap-2 text-sm"><Car className="h-4 w-4 text-muted-foreground" /> {owner.vehicleType || "EV"}</div>
                        <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> Joined: {new Date(owner.createdAt).toLocaleDateString()}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const saveSettings = () => {
    updateStationSettingsMut.mutate({
      name: stationName,
      address: stationAddress,
      city: stationCity,
      slots: +stationSlots,
      lat: +stationLat,
      lng: +stationLng,
      operatingHoursStart,
      operatingHoursEnd,
      acceptsOnlinePayments,
      upiId
    });
  };

  const renderSettings = () => (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Station Profile Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm">Station Name</Label>
          <Input value={stationName} onChange={(e) => setStationName(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div>
          <Label className="text-sm">Address</Label>
          <Input value={stationAddress} onChange={(e) => setStationAddress(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div>
          <Label className="text-sm">City</Label>
          <Input value={stationCity} onChange={(e) => setStationCity(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div>
          <Label className="text-sm">Total Slots</Label>
          <Input type="number" value={stationSlots} onChange={(e) => setStationSlots(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div>
          <Label className="text-sm">Operating Hours Start</Label>
          <Input type="time" value={operatingHoursStart} onChange={(e) => setOperatingHoursStart(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div>
          <Label className="text-sm">Operating Hours End</Label>
          <Input type="time" value={operatingHoursEnd} onChange={(e) => setOperatingHoursEnd(e.target.value)} className="mt-1 bg-secondary border-border" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="onlinePay" checked={acceptsOnlinePayments} onChange={(e) => setAcceptsOnlinePayments(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <Label htmlFor="onlinePay" className="text-sm cursor-pointer">Accept Online Payments (UPI/Card/Wallet)</Label>
        </div>
        {acceptsOnlinePayments && (
          <div>
            <Label className="text-sm">UPI ID (Optional)</Label>
            <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. yourname@upi" className="mt-1 bg-secondary border-border" />
          </div>
        )}
        <div>
          <Label className="text-sm">Station Location</Label>
          <div className="text-xs text-muted-foreground mb-2">Search for a location or click on the map to drop a pin</div>
          <div className="flex gap-2 mb-3">
            <Input 
              placeholder="Search city, address, or landmark..." 
              value={mapSearchQuery} 
              onChange={(e) => setMapSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
              className="bg-secondary border-border"
            />
            <Button type="button" onClick={searchLocation} disabled={isSearchingMap} variant="outline">
              {isSearchingMap ? "Searching..." : "Search"}
            </Button>
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-border z-0 relative">
            <NativeLeafletMap 
              center={(!isNaN(parseFloat(stationLat)) && !isNaN(parseFloat(stationLng))) ? [parseFloat(stationLat), parseFloat(stationLng)] : [20.5937, 78.9629]} 
              zoom={(!isNaN(parseFloat(stationLat)) && !isNaN(parseFloat(stationLng))) ? 13 : 4} 
              markerPosition={(!isNaN(parseFloat(stationLat)) && !isNaN(parseFloat(stationLng))) ? [parseFloat(stationLat), parseFloat(stationLng)] : null}
              onMapClick={(lat, lng) => { setStationLat(lat.toString()); setStationLng(lng.toString()); }}
            />
          </div>
        </div>
        <Button onClick={saveSettings} className="w-full gradient-primary text-primary-foreground">Save Changes</Button>
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
