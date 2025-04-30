# Integrating With HubSpot I: Foundations Practicum

This repository contains my submission for the HubSpot Academy "Integrating With HubSpot I: Foundations" practicum.

## Custom Object

My custom object represents "Books" with the following properties:
- Name (string)
- Author (string)
- PublicationYear (number)

Link to custom object in HubSpot: https://app.hubspot.com/contacts/48807334/objects/2-44080467/views/all/list

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- npm
- A HubSpot developer account
- A private app with the following permissions:
  - crm.schemas.custom (read and write)
  - crm.objects.custom (read and write)
  - crm.objects.contacts (read and write)

### Installation

1. Clone this repository:
```
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
HUBSPOT_API_KEY=your_private_app_access_token
HUBSPOT_CUSTOM_OBJECT_ID=your_custom_object_id
PORT=3000
```

4. Start the application:
```
node index.js
```

5. Open your browser and navigate to `http://localhost:3000`

## Features

- Display a table of custom objects from HubSpot
- Add new custom objects through a form interface
- Automatic redirection to the homepage after creating a custom object

## Project Structure

- `index.js`: Main application file with Express routes and HubSpot API interactions
- `views/`: Pug templates for rendering HTML
  - `homepage.pug`: Template for the homepage with the custom objects table
  - `updates.pug`: Template for the form to create new custom objects
  - `error.pug`: Template for error pages
- `public/css/`: CSS styles
  - `style.css`: Stylesheet for the application
- `.env`: Environment variables (not committed to Git)
- `.env-sample`: Sample environment variables file

## HubSpot Custom Object Setup

1. Created a custom object schema for "Books"
2. Added the required properties: Name, Author, and PublicationYear
3. Added at least three sample records
4. Associated the custom object with contacts

## API Endpoints Used

- `GET /crm/v3/objects/{objectId}`: Retrieve custom objects
- `POST /crm/v3/objects/{objectId}`: Create a new custom object