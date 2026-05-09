import re

filepath = r"c:\Users\HP\OneDrive\Desktop\Projects\charge-now-ev\src\pages\OwnerDashboard.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport api from "@/lib/api";\nimport { io } from "socket.io-client";')

# Remove mock data import and keep types
content = content.replace('import { mockStations, mockBookings, bookedSlots, type Booking, type Station } from "@/lib/mock-data";', 'import { bookedSlots, type Booking, type Station } from "@/lib/mock-data";')

# 2. Add Socket and Query Client, replace activeStations and bookings logic
state_vars_re = r'const \[selectedStation.*?const activeStations = mockStations.filter\(\(s\) => s\.status === "active"\);'

replacement = """const queryClient = useQueryClient();
  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => { const res = await api.get('/stations'); return res.data; }
  });
  
  const { data: initialBookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => { const res = await api.get('/bookings'); return res.data; }
  });

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [duration, setDuration] = useState(1);
  const [chargeType, setChargeType] = useState<"AC" | "DC">("DC");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "Wallet" | "COD">("UPI");
  const [carModel, setCarModel] = useState("");
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  
  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("station-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    });
    socket.on("new-booking", () => {
      refetchBookings();
    });
    return () => { socket.disconnect(); };
  }, [queryClient, refetchBookings]);

  // Use state from query
  const bookings = initialBookings;
  const activeStations = stations.filter((s: Station) => s.status === "active");"""

content = re.sub(state_vars_re, replacement, content, flags=re.DOTALL)

# 3. Update handleBook to mutate
handle_book_re = r'const handleBook = \(\) => \{.+?toast\.success\(`Slot booked at \$\{selectedStation\.name\}!`\);.*?\}'
new_handle_book = """const createBookingMut = useMutation({
    mutationFn: async (newBooking: any) => await api.post('/bookings', newBooking),
    onSuccess: () => {
      toast.success(`Slot booked!`);
      refetchBookings();
      setSelectedStation(null);
      setSelectedSlot("");
      setCarModel("");
    }
  });

  const handleBook = () => {
    if (!selectedStation || !selectedSlot) return;
    const estimatedKWh = duration * (chargeType === "DC" ? 50 : 7.4);
    const price = Math.round(getPrice(selectedStation) * estimatedKWh);
    
    // We intentionally map `selectedStation.id` to Station model objectId
    createBookingMut.mutate({
      stationId: selectedStation._id || selectedStation.id,
      stationName: selectedStation.name,
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
    });
  };"""

content = re.sub(handle_book_re, new_handle_book, content, flags=re.DOTALL)

# 4. Update cancelBooking
cancel_booking_re = r'const cancelBooking = \(id: string\) => \{.+?toast\.success\("Booking cancelled!"\);.*?\}'
new_cancel_booking = """const updateBookingMut = useMutation({
    mutationFn: async ({ id, status, paymentStatus }: any) => await api.put(`/bookings/${id}`, { status, paymentStatus }),
    onSuccess: () => {
      toast.success("Booking updated!");
      refetchBookings();
    }
  });

  const cancelBooking = (id: string) => {
    const b = bookings.find((b: any) => b._id === id || b.id === id);
    if (!b) return;
    updateBookingMut.mutate({ 
      id: b._id || b.id, 
      status: "cancelled", 
      paymentStatus: b.paymentMethod === "COD" ? "pending" : "refunded" 
    });
  };"""

content = re.sub(cancel_booking_re, new_cancel_booking, content, flags=re.DOTALL)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("OwnerDashboard.tsx patched!")
