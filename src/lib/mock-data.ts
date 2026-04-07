export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  slots: number;
  availableSlots: number;
  pricePerKWhAC: number;
  pricePerKWhDC: number;
  rating: number;
  status: "active" | "pending" | "suspended";
  lat: number;
  lng: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  commissionRate?: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlot: string;
  duration: number;
  amount: number;
  status: "pending" | "approved" | "completed" | "cancelled";
  vehicleType: string;
  carModel?: string;
  chargeType: "AC" | "DC";
  paymentMethod: "UPI" | "Card" | "Wallet" | "COD";
  paymentStatus: "paid" | "pending" | "refunded";
  review?: Review;
}

export interface EVOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  totalBookings: number;
  totalSpent: number;
  joinedDate: string;
}

export const mockEVOwners: EVOwner[] = [
  { id: "u1", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", vehicleType: "Tata Nexon EV", totalBookings: 12, totalSpent: 3200, joinedDate: "2026-01-15" },
  { id: "u2", name: "Priya Singh", email: "priya@example.com", phone: "+91 87654 32109", vehicleType: "MG ZS EV", totalBookings: 8, totalSpent: 2100, joinedDate: "2026-02-01" },
  { id: "u3", name: "Amit Patel", email: "amit@example.com", phone: "+91 76543 21098", vehicleType: "Hyundai Kona", totalBookings: 15, totalSpent: 4500, joinedDate: "2025-12-20" },
  { id: "u4", name: "Sneha Gupta", email: "sneha@example.com", phone: "+91 65432 10987", vehicleType: "BYD Atto 3", totalBookings: 6, totalSpent: 1800, joinedDate: "2026-03-01" },
  { id: "u5", name: "Vikram Reddy", email: "vikram@example.com", phone: "+91 54321 09876", vehicleType: "Tata Tigor EV", totalBookings: 20, totalSpent: 5600, joinedDate: "2025-11-10" },
];

export const mockStations: Station[] = [
  { id: "s1", name: "GreenCharge Hub", address: "MG Road, Sector 14", city: "Gurugram", slots: 8, availableSlots: 3, pricePerKWhAC: 12, pricePerKWhDC: 18, rating: 4.5, status: "active", lat: 28.4595, lng: 77.0266, ownerName: "Rajesh Kumar", ownerEmail: "rajesh@greencharge.com", ownerPhone: "+91 99887 76655", commissionRate: 15 },
  { id: "s2", name: "VoltZone Station", address: "Connaught Place", city: "New Delhi", slots: 12, availableSlots: 7, pricePerKWhAC: 14, pricePerKWhDC: 20, rating: 4.8, status: "active", lat: 28.6315, lng: 77.2167, ownerName: "Meera Joshi", ownerEmail: "meera@voltzone.com", ownerPhone: "+91 88776 65544", commissionRate: 12 },
  { id: "s3", name: "EcoCharge Point", address: "Electronic City", city: "Bangalore", slots: 6, availableSlots: 0, pricePerKWhAC: 10, pricePerKWhDC: 15, rating: 4.2, status: "active", lat: 12.8399, lng: 77.6770, ownerName: "Suresh Nair", ownerEmail: "suresh@ecocharge.com", ownerPhone: "+91 77665 54433", commissionRate: 15 },
  { id: "s4", name: "PowerUp Station", address: "Andheri West", city: "Mumbai", slots: 10, availableSlots: 5, pricePerKWhAC: 16, pricePerKWhDC: 22, rating: 4.6, status: "pending", lat: 19.1364, lng: 72.8296, ownerName: "Kavita Desai", ownerEmail: "kavita@powerup.com", ownerPhone: "+91 66554 43322", commissionRate: 10 },
  { id: "s5", name: "ChargeIt Fast", address: "Banjara Hills", city: "Hyderabad", slots: 4, availableSlots: 2, pricePerKWhAC: 9, pricePerKWhDC: 14, rating: 4.0, status: "suspended", lat: 17.4156, lng: 78.4347, ownerName: "Arjun Rao", ownerEmail: "arjun@chargeit.com", ownerPhone: "+91 55443 32211", commissionRate: 15 },
];

export const mockBookings: Booking[] = [
  { id: "b1", stationId: "s1", stationName: "GreenCharge Hub", userId: "u1", userName: "Rahul Sharma", userEmail: "rahul@example.com", userPhone: "+91 98765 43210", date: "2026-03-30", timeSlot: "10:00 AM", duration: 2, amount: 300, status: "pending", vehicleType: "Tata Nexon EV", carModel: "Nexon EV Max", chargeType: "DC", paymentMethod: "UPI", paymentStatus: "paid" },
  { id: "b2", stationId: "s2", stationName: "VoltZone Station", userId: "u2", userName: "Priya Singh", userEmail: "priya@example.com", userPhone: "+91 87654 32109", date: "2026-03-30", timeSlot: "2:00 PM", duration: 1, amount: 100, status: "approved", vehicleType: "MG ZS EV", chargeType: "AC", paymentMethod: "Card", paymentStatus: "paid" },
  { id: "b3", stationId: "s1", stationName: "GreenCharge Hub", userId: "u3", userName: "Amit Patel", userEmail: "amit@example.com", userPhone: "+91 76543 21098", date: "2026-03-29", timeSlot: "4:00 PM", duration: 3, amount: 450, status: "completed", vehicleType: "Hyundai Kona", chargeType: "DC", paymentMethod: "Wallet", paymentStatus: "paid" },
  { id: "b4", stationId: "s3", stationName: "EcoCharge Point", userId: "u1", userName: "Rahul Sharma", userEmail: "rahul@example.com", userPhone: "+91 98765 43210", date: "2026-03-31", timeSlot: "9:00 AM", duration: 1, amount: 70, status: "pending", vehicleType: "Tata Nexon EV", chargeType: "AC", paymentMethod: "COD", paymentStatus: "pending" },
  { id: "b5", stationId: "s2", stationName: "VoltZone Station", userId: "u4", userName: "Sneha Gupta", userEmail: "sneha@example.com", userPhone: "+91 65432 10987", date: "2026-03-28", timeSlot: "6:00 PM", duration: 2, amount: 360, status: "completed", vehicleType: "BYD Atto 3", chargeType: "DC", paymentMethod: "Card", paymentStatus: "paid" },
];

// Booked slots for block timing
export const bookedSlots: Record<string, string[]> = {
  s1: ["09:30 AM", "10:00 AM", "02:00 PM"],
  s2: ["11:00 AM", "11:30 AM"],
  s3: ["09:00 AM", "01:00 PM", "01:30 PM"],
};
