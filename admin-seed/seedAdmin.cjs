const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars from the backend directory
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const connectDB = require("../backend/config/db");
const User = require("../backend/models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if an admin exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log(`Admin user already exists with email: ${adminExists.email}`);
    } else {
      // Create admin user
      const admin = new User({
        name: "Super Admin",
        email: "admin@chargenow.com",
        phone: "1234567890",
        password: "adminpassword", // In User model, it will hash on save
        role: "admin",
      });

      await admin.save();
      console.log(`Admin created successfully with email: ${admin.email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
