const Booking = require("../models/Booking");

const getBookings = async (req, res) => {
  try {
    // If admin, all bookings. If owner/user, only theirs.
    let filter = {};
    if (req.user.role === "admin") {
      // Admin sees all, no filter needed.
    } else if (req.user.role === "station") {
      // Station owner sees bookings made to their stations.
      const Station = require("../models/Station");
      const myStations = await Station.find({ ownerId: req.user._id });
      const myStationIds = myStations.map(s => s._id);
      filter.stationId = { $in: myStationIds };
    } else {
      // EV Owner (or regular user) sees their own bookings.
      filter.userId = req.user._id;
    }
    const bookings = await Booking.find(filter).populate("stationId", "name");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, userId: req.user._id });
    const createdBooking = await booking.save();
    
    // Notify about new booking
    if (req.io) {
      req.io.emit("new-booking", createdBooking);
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      booking.status = req.body.status || booking.status;
      booking.paymentStatus = req.body.paymentStatus || booking.paymentStatus;
      if (req.body.review) {
        booking.review = req.body.review;
        const Station = require("../models/Station");
        const station = await Station.findById(booking.stationId);
        if (station) {
          station.reviews.push({
            userId: req.user._id,
            userName: req.body.review.userName,
            rating: req.body.review.rating,
            comment: req.body.review.comment
          });
          const avg = station.reviews.reduce((acc, r) => acc + r.rating, 0) / station.reviews.length;
          station.rating = Math.round(avg * 10) / 10;
          await station.save();
          if (req.io) req.io.emit("station-updated", station);
        }
      }
      
      const updatedBooking = await booking.save();
      
      // Notify about booking update
      if (req.io) {
        req.io.emit("booking-updated", updatedBooking);
      }
      
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            await Booking.deleteOne({ _id: req.params.id });
            res.json({ message: "Booking removed" });
        } else {
            res.status(404).json({ message: "Booking not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllBookedSlots = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $ne: "cancelled" } }).select("stationId date timeSlot status");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking, getAllBookedSlots };
