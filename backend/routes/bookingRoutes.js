const express = require("express");
const router = express.Router();
const { getBookings, getBookingById, createBooking, updateBookingStatus, deleteBooking, getAllBookedSlots } = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

router.route("/all-slots").get(protect, getAllBookedSlots);
router.route("/").get(protect, getBookings).post(protect, createBooking);
router.route("/:id").get(protect, getBookingById).put(protect, updateBookingStatus).delete(protect, deleteBooking);

module.exports = router;
