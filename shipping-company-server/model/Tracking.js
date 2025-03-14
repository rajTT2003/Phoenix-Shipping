const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema({
  trackingNumber: { type: String, unique: true, required: true },
  carrier: { type: String }, // Optional: If user provides a carrier
  status: { type: Object, required: true },  // Stores tracking details
  lastUpdated: { type: Date, default: Date.now }
});

// Auto-delete old data after 4 hours (14400 seconds)
TrackingSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 14400 });

const Tracking = mongoose.model("Tracking", TrackingSchema);
module.exports = Tracking;
