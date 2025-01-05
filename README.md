# Badminton Tournament Scraper

This project scrapes information about badminton tournaments to notify me about tournaments.

## Features

- Filter tournaments by location, range, date, rank, type of match (single, double, mixte), number of players.
- Send notifications via email.

## Setup

Make sure you have node.js and playwright installed before running commands.

```
npm install
npm playwright install
```

### Configure Filters

You can configure filters such as location and date range directly within the script. Adjust these settings to tailor the scraping process to your needs.

### Environment Variables

Create a `.env` file in the root directory and include the following fields:

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_email_app_password

EMAIL_RECIPIENT=recipient_email@example.com

CITY=your_city

RADIUS=radius_in_km (e.g 50)

~~LICENCE_NUMBER=your_licence_number~~

~~LICENCE_PASS=your_licence_password~~

### Run

```
npx playwright test
```
