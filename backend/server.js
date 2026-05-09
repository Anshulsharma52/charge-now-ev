const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const stationRoutes = require("./routes/stationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Inject io into request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/stats", async (req, res) => {
  try {
    const Station = require("./models/Station");
    const Booking = require("./models/Booking");
    const totalStations = await Station.countDocuments({ status: "active" });
    const totalBookings = await Booking.countDocuments({});
    const distinctCities = await Station.distinct("city", { status: "active" });
    res.json({
      stations: totalStations,
      bookings: totalBookings,
      cities: distinctCities.length,
      uptime: "99.9%"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
