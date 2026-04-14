const express = require('express');
const router = express.Router();
const WebhookLog = require('../models/webhookLog.model');


router.post('/freshdesk', async (req, res) => {
  try {
    const ticketId = req.body?.ticket_id;

    const exists = await WebhookLog.findOne({
      'payload.ticket_id': ticketId
    });

    if (!exists) {
      await WebhookLog.create({
        type: req.body?.event || 'ticket_created',
        payload: req.body
      });
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    res.status(500).send('Error');
  }
});


router.get('/logs', async (req, res) => {
  try {
    const logs = await WebhookLog.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;