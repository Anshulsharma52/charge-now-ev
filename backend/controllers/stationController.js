const Station = require("../models/Station");

const getStations = async (req, res) => {
  try {
    const stations = await Station.find({});
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ message: "Station not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStation = async (req, res) => {
  try {
    // Duplicate user check
    const existingUserStation = await Station.findOne({ ownerId: req.user._id });
    if (existingUserStation) {
      return res.status(400).json({ message: "You have already registered a station." });
    }

    // Duplicate name & city check
    const existingNameCity = await Station.findOne({ name: req.body.name, city: req.body.city });
    if (existingNameCity) {
      return res.status(400).json({ message: "A station with this name already exists in this city." });
    }

    const stationData = {
      ...req.body,
      ownerId: req.user._id,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      ownerPhone: req.user.phone
    };
    
    // Provide some default dummy geo location for India if not provided via map
    if (!stationData.lat) stationData.lat = 20.5937;
    if (!stationData.lng) stationData.lng = 78.9629;

    const station = new Station(stationData);
    const createdStation = await station.save();
    res.status(201).json(createdStation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyStation = async (req, res) => {
  try {
    const station = await Station.findOne({ ownerId: req.user._id });
    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ message: "No station registered for this user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (station) {
      Object.assign(station, req.body);
      const updatedStation = await station.save();
      
      // Emit socket event if availableSlots changed
      if (req.body.availableSlots !== undefined && req.io) {
        req.io.emit("station-updated", updatedStation);
      }
      
      res.json(updatedStation);
    } else {
      res.status(404).json({ message: "Station not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (station) {
      await Station.deleteOne({ _id: req.params.id });
      res.json({ message: "Station removed" });
    } else {
      res.status(404).json({ message: "Station not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStations, getStationById, createStation, updateStation, deleteStation, getMyStation };
