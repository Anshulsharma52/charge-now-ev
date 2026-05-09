const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, {
  timestamps: true,
});

const stationSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  slots: { type: Number, required: true },
  availableSlots: { type: Number, required: true, default: 0 },
  pricePerKWhAC: { type: Number, required: true },
  pricePerKWhDC: { type: Number, required: true },
  rating: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, enum: ["active", "pending", "suspended"], default: "pending" },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String },
  ownerPhone: { type: String },
  commissionRate: { type: Number },
  nextAvailableTime: { type: String },
  operatingHoursStart: { type: String, default: "00:00" },
  operatingHoursEnd: { type: String, default: "23:59" },
  acceptsOnlinePayments: { type: Boolean, default: false },
  upiId: { type: String },
  reviews: [reviewSchema],
}, {
  timestamps: true,
});

const Station = mongoose.model("Station", stationSchema);
module.exports = Station;
