const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');


const integrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    freshdesk: {
      domain: String,
      apiKey: String
    },
    hubspot: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    }
  },
  { timestamps: true }
);

const Integration = mongoose.model('Integration', integrationSchema);


router.post('/freshdesk', async (req, res) => {
  try {
    const { domain, apiKey, userId } = req.body;

    if (!domain || !apiKey || !userId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .trim();

    const cleanApiKey = apiKey.trim();

    const updated = await Integration.findOneAndUpdate(
      { userId },
      {
        $set: {
          freshdesk: {
            domain: cleanDomain,
            apiKey: cleanApiKey
          }
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    res.json({
      success: true,
      message: 'Freshdesk connected successfully',
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Freshdesk connection failed' });
  }
});


router.get('/:userId', async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: new mongoose.Types.ObjectId(req.params.userId)
    });

    res.json({ success: true, data: integration });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch integration' });
  }
});


router.get('/tickets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const integration = await Integration.findOne({
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!integration || !integration.freshdesk) {
      return res.status(400).json({
        success: false,
        message: 'Freshdesk not connected'
      });
    }

    let { domain, apiKey } = integration.freshdesk;

    domain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .trim();

    apiKey = apiKey.trim();

    const finalUrl = `https://${domain}/api/v2/tickets`;


    const response = await axios.get(finalUrl, {
      auth: {
        username: apiKey,
        password: 'X'
      }
    });

    return res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error(" ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.response?.data || error.message
    });
  }
});

router.delete('/freshdesk/:userId', async (req, res) => {
  try {
    await Integration.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(req.params.userId) },
      { $unset: { freshdesk: "" } }
    );

    res.json({ success: true, message: 'Freshdesk disconnected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect Freshdesk' });
  }
});


router.post('/hubspot', async (req, res) => {
  try {
    const { accessToken, refreshToken, expiresAt, userId } = req.body;

    const updated = await Integration.findOneAndUpdate(
      { userId },
      {
        $set: {
          hubspot: {
            accessToken,
            refreshToken,
            expiresAt
          }
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: 'HubSpot connection failed' });
  }
});


router.delete('/hubspot/:userId', async (req, res) => {
  try {
    await Integration.findOneAndUpdate(
      { userId },
      { $unset: { hubspot: "" } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect HubSpot' });
  }
});
router.get('/conversations/:userId/:ticketId', async (req, res) => {
  try {
    const { userId, ticketId } = req.params;

    const integration = await Integration.findOne({
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!integration?.freshdesk) {
      return res.status(400).json({
        success: false,
        message: 'Freshdesk not connected'
      });
    }

    let { domain, apiKey } = integration.freshdesk;

    domain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    const url = `https://${domain}/api/v2/tickets/${ticketId}/conversations`;

    const encodedAuth = Buffer.from(`${apiKey}:X`).toString('base64');

    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${encodedAuth}`
      }
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.error("Conversation error:", err.response?.data || err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

router.get('/hubspot/connect', (req, res) => {
  const { userId } = req.query;

  const url =
    `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}` +
    `&redirect_uri=${process.env.HUBSPOT_REDIRECT_URI}` +
    `&scope=crm.objects.contacts.read` +
    `&state=${userId}`;


  res.redirect(url);
});

router.get('/hubspot/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;
    if (!code) {
      return res.status(400).send("No code received");
    }

    // 🔥 Exchange code → access token
    const tokenRes = await axios.post(
      'https://api.hubapi.com/oauth/v1/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.HUBSPOT_CLIENT_ID,
          client_secret: process.env.HUBSPOT_CLIENT_SECRET,
          redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
          code
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;


    await Integration.findOneAndUpdate(
      { userId },
      {
        $set: {
          hubspot: {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: new Date(Date.now() + expires_in * 1000)
          }
        }
      },
      { new: true, upsert: true }
    );


    res.redirect('http://localhost:4200/dashboard/integrations');

  } catch (error) {
    console.error(" CALLBACK ERROR:", error.response?.data || error.message);
    res.send("HubSpot connection failed");
  }
});



router.get('/requester/:userId/:requesterId', async (req, res) => {
  try {
    const { userId, requesterId } = req.params;

    const integration = await Integration.findOne({ userId });

    const { domain, apiKey } = integration.freshdesk;

    const url = `https://${domain}/api/v2/contacts/${requesterId}`;

    const response = await axios.get(url, {
      auth: {
        username: apiKey,
        password: 'X'
      }
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch requester' });
  }
});

router.get('/hubspot/contact/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const integration = await Integration.findOne({ userId });

    if (!integration?.hubspot?.accessToken) {
      return res.status(400).json({
        message: 'HubSpot not connected'
      });
    }

    const token = integration.hubspot.accessToken;


    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email
              }
            ]
          }
        ],
        properties: [
          "firstname",
          "lastname",
          "email",
          "phone",
          "lifecyclestage",
          "company"
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const results = response.data.results || [];


    if (results.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No contact found in HubSpot'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });

  } catch (error) {
    console.error("HUBSPOT ERROR:");
    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: 'HubSpot fetch failed',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;