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

    // Get custom objects from HubSpot API
    const response = await hubspotClient.get(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}`, {
      params: {
        properties: propertyNames.join(","),
        limit: 100
      }
    });

    const customObjects = response.data.results || [];

    // Render the homepage template with the custom objects data
    res.render('homepage', {
      title: 'Book Collection Dashboard',
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

// 2. Add/Edit Custom Object Form Page
app.get('/update-cobj/:id?', async (req, res) => {
  const { id } = req.params;
  let bookData = { properties: { name: '', author: '', publicationyear: '' } };
  let isEdit = false;

  // If ID is provided, fetch the object data for editing
  if (id) {
    try {
      const schemaResponse = await hubspotClient.get(`/crm/v3/schemas/${HUBSPOT_CUSTOM_OBJECT_ID}`);
      const propertyNames = schemaResponse.data.properties.map(p => p.name);
      const response = await hubspotClient.get(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}/${id}`, {
        params: {
          properties: propertyNames.join(",")
        }
      });
      bookData = response.data;
      isEdit = true;
    } catch (error) {
      console.error('Error fetching book details:', error.response ? error.response.data : error.message);
      return res.status(404).render('error', {
        message: 'Book not found or could not be retrieved.'
      });
    }
  }

  res.render('update-form', {
    title: isEdit ? 'Edit Book' : 'Add New Book',
    book: bookData,
    isEdit: isEdit
  });
});

// 3. Handle Form Submission for Create/Update
app.post('/update-cobj/:id?', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, author, publicationyear } = req.body;
    const bookData = {
      properties: {
        name: name,
        author: author,
        publicationyear: publicationyear
      }
    };

    // If ID exists, update the existing object
    if (id) {
      await hubspotClient.patch(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}/${id}`, bookData);
    } else {
      // Otherwise create a new object
      await hubspotClient.post(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}`, bookData);
    }

    // Redirect back to homepage after successful operation
    res.redirect('/');
  } catch (error) {
    console.error('Error with custom object operation:', error.response ? error.response.data : error.message);
    res.status(500).render('error', {
      message: 'Failed to process book data in HubSpot.'
    });
  }
});

// 4. Delete Custom Object
app.post('/delete-cobj/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await hubspotClient.delete(`/crm/v3/objects/${HUBSPOT_CUSTOM_OBJECT_ID}/${id}`);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting custom object:', error.response ? error.response.data : error.message);
    res.status(500).render('error', {
      message: 'Failed to delete book from HubSpot.'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});