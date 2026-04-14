// models/webhook.model.js

const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  event: String,
  ticketId: String,
  payload: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WebhookLog', webhookSchema);