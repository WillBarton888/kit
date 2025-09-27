# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kangaroo Island Transfers is a simple web-based booking system for transfer services. The project consists of a static HTML/CSS/JavaScript application with a booking form for customers to request transfers.

## Development Setup

This is a simple static web project that requires no build tools or dependencies.

To run the project:
1. Open `index.html` in a web browser
2. Or serve the files using a local server like `python -m http.server` or `npx serve`

## Project Structure

```
├── index.html      # Main HTML file with booking form
├── styles.css      # CSS styling for the form and layout
├── script.js       # JavaScript for form validation and submission
└── CLAUDE.md       # This file
```

## Features

- **Booking Form**: Collects pickup location, drop-off location, date, time, and passenger count
- **Form Validation**: Client-side validation with error messages
- **Responsive Design**: Mobile-friendly layout
- **Success Confirmation**: Shows booking details after submission

## Form Fields

- Pickup Location (text input, required)
- Drop-off Location (text input, required)
- Date (date input, required, minimum: today)
- Time (time input, required)
- Number of Passengers (select dropdown, 1-8+, required)
- Additional Notes (textarea, optional)

## JavaScript Functionality

The `script.js` file handles:
- Form validation and error display
- Date/time validation (prevents past bookings)
- Success message display with formatted booking details
- Australian date/time formatting

## Styling

The application uses a modern gradient design with:
- Purple/blue gradient background
- Clean white form container
- Responsive grid layout for date/time fields
- Hover effects and smooth transitions
- Mobile-responsive design

## Future Enhancements

- Backend integration for form submission
- Email confirmation system
- Payment processing
- Booking management system
- Database integration