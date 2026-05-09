const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });
    
    const userExists = query.length > 0 ? await User.findOne({ $or: query }) : null;
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "evowner",
    });

    if (req.io) {
      req.io.emit("new-user");
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { emailOrPhone, password, role } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (await user.matchPassword(password)) {
      if (role && role !== "admin") {
        if (role === "evowner" && !["evowner", "owner"].includes(user.role)) {
          return res.status(403).json({ message: `Access denied. You are registered as a ${user.role}.` });
        } else if (role !== "evowner" && user.role !== role) {
          return res.status(403).json({ message: `Access denied. You are registered as a ${user.role}.` });
        }
      }
      
      // Opt: check role match if required, here we just return logged in info
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, getAllUsers };
