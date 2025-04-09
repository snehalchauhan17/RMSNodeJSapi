const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId:{     type: String,
    required: true},

  createdAt: { type: Date, default: Date.now, expires: "7d" }, // Auto-delete after 7 days
});

module.exports = mongoose.model("UserSession", userSessionSchema);
