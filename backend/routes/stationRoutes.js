const express = require("express");
const router = express.Router();
const { getStations, getStationById, createStation, updateStation, deleteStation, getMyStation } = require("../controllers/stationController");
const { protect } = require("../middleware/auth");

router.route("/").get(getStations).post(protect, createStation);
router.route("/my-station").get(protect, getMyStation);
router.route("/:id").get(getStationById).put(protect, updateStation).delete(protect, deleteStation);

module.exports = router;
