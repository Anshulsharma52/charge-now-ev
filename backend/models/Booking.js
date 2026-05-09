const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Station" },
  stationName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, required: true },
  userEmail: { type: String },
  userPhone: { type: String },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  duration: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ["pending", "approved", "completed", "cancelled"], default: "pending" },
  vehicleType: { type: String },
  carModel: { type: String },
  chargeType: { type: String, required: true, enum: ["AC", "DC"] },
  paymentMethod: { type: String, required: true, enum: ["UPI", "Card", "Wallet", "COD"] },
  paymentStatus: { type: String, required: true, enum: ["paid", "pending", "refunded"], default: "pending" },
  review: {
    id: String,
    userId: String,
    userName: String,
    rating: Number,
    comment: String,
    date: String
  }
}, {
  timestamps: true,
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
