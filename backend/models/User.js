const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true }, // Not always required since they might login via phone
  phone: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["evowner", "owner", "station", "admin"] },
  vehicleType: { type: String },
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;
