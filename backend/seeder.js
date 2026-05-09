const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Station = require("./models/Station");
const Booking = require("./models/Booking");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const mockStations = [
  { name: "GreenCharge Hub", address: "MG Road, Sector 14", city: "Gurugram", slots: 8, availableSlots: 3, pricePerKWhAC: 12, pricePerKWhDC: 18, rating: 4.5, status: "active", lat: 28.4595, lng: 77.0266, ownerName: "Rajesh Kumar", ownerEmail: "rajesh@greencharge.com", ownerPhone: "+91 99887 76655", commissionRate: 15 },
  { name: "VoltZone Station", address: "Connaught Place", city: "New Delhi", slots: 12, availableSlots: 7, pricePerKWhAC: 14, pricePerKWhDC: 20, rating: 4.8, status: "active", lat: 28.6315, lng: 77.2167, ownerName: "Meera Joshi", ownerEmail: "meera@voltzone.com", ownerPhone: "+91 88776 65544", commissionRate: 12 },
  { name: "EcoCharge Point", address: "Electronic City", city: "Bangalore", slots: 6, availableSlots: 0, pricePerKWhAC: 10, pricePerKWhDC: 15, rating: 4.2, status: "active", lat: 12.8399, lng: 77.6770, ownerName: "Suresh Nair", ownerEmail: "suresh@ecocharge.com", ownerPhone: "+91 77665 54433", commissionRate: 15 },
  { name: "PowerUp Station", address: "Andheri West", city: "Mumbai", slots: 10, availableSlots: 5, pricePerKWhAC: 16, pricePerKWhDC: 22, rating: 4.6, status: "pending", lat: 19.1364, lng: 72.8296, ownerName: "Kavita Desai", ownerEmail: "kavita@powerup.com", ownerPhone: "+91 66554 43322", commissionRate: 10 },
  { name: "ChargeIt Fast", address: "Banjara Hills", city: "Hyderabad", slots: 4, availableSlots: 2, pricePerKWhAC: 9, pricePerKWhDC: 14, rating: 4.0, status: "suspended", lat: 17.4156, lng: 78.4347, ownerName: "Arjun Rao", ownerEmail: "arjun@chargeit.com", ownerPhone: "+91 55443 32211", commissionRate: 15 },
];

const mockEVOwners = [
  { name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", password: "password123", role: "owner", vehicleType: "Tata Nexon EV", totalBookings: 12, totalSpent: 3200 },
  { name: "Priya Singh", email: "priya@example.com", phone: "+91 87654 32109", password: "password123", role: "owner", vehicleType: "MG ZS EV", totalBookings: 8, totalSpent: 2100 },
  { name: "Anshul Sharma", email: "anshulsharma@gmail.com", phone: "1234567890", password: "Anshul @8058", role: "admin" },
  { name: "Station Manager", email: "station@example.com", phone: "0987654321", password: "station", role: "station" }
];

const importData = async () => {
  try {
    await Booking.deleteMany();
    await Station.deleteMany();
    await User.deleteMany();

    const createdUsers = [];
    for (const u of mockEVOwners) {
      createdUsers.push(await User.create(u));
    }
    const adminUser = createdUsers[0]._id;

    const stationOwner = createdUsers.find(u => u.role === "station" || u.role === "admin" || u.role === "owner")._id;
    const stationsWithOwner = mockStations.map(station => ({ ...station, ownerId: stationOwner }));

    await Station.insertMany(stationsWithOwner);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
