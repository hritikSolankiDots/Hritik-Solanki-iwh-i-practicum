require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Pug Template Engine Setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// HubSpot API Configuration
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_CUSTOM_OBJECT_ID = process.env.HUBSPOT_CUSTOM_OBJECT_ID;

// API Request Configuration
const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Routes
// 1. Homepage - Display custom objects in a table
app.get('/', async (req, res) => {
  try {
    // First, get the schema to check available properties
    const schemaResponse = await hubspotClient.get(`/crm/v3/schemas/${HUBSPOT_CUSTOM_OBJECT_ID}`);
    const propertyNames = schemaResponse.data.properties.map(p => p.name);

    // Get custom objects from HubSpot API - try with '*' to get all properties
    const response = await hubspotClient.get(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}`, {
      params: {
        properties: propertyNames.join(","),
        limit: 100
      }
    });



    const customObjects = response.data.results || [];

    // Render the homepage template with the custom objects data
    res.render('homepage', {
      title: 'Custom Objects | Integrating With HubSpot I Practicum',
      customObjects: customObjects,
      propertyNames: propertyNames
    });
  } catch (error) {
    console.error('Error fetching custom objects:', error.response ? error.response.data : error.message);
    res.status(500).render('error', {
      message: 'Failed to fetch custom objects from HubSpot: ' + (error.response ? JSON.stringify(error.response.data) : error.message)
    });
  }
});

// 2. Update Custom Object Form Page
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
  });
});

// 3. Handle Form Submission
app.post('/update-cobj', async (req, res) => {
  try {
    // Extract form data
    const { name, author, publicationyear } = req.body;

    // Create a new custom object in HubSpot
    const response = await hubspotClient.post(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}`, {
      properties: {
        name: name,
        author: author,
        publicationyear: publicationyear
      }
    });

    // Redirect back to homepage after successful creation
    res.redirect('/');
  } catch (error) {
    console.error('Error creating custom object:', error.response ? error.response.data : error.message);
    res.status(500).render('error', {
      message: 'Failed to create custom object in HubSpot.'
    });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});