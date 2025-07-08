# Portfolio Environment Setup

## Required Environment Variables

Create a `.env` file in the portfolio root directory with the following variables:

```bash
# Backend API URL (for AI chat and contact form)
REACT_APP_BACKEND_URL=http://localhost:5000

# For production deployment, update to your backend URL:
# REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## Development Testing

1. Ensure the backend is running on port 5000
2. Start the portfolio: `npm start`
3. Test the chat widget functionality
4. Test the contact form submission

## Production Deployment

For production, update the backend URL to your deployed backend service URL.

## Email Service Migration Note

The contact form now uses the backend with **Nodemailer for reliable server-side email delivery**. This replaces EmailJS since EmailJS blocks non-browser applications.

## API Integration Features

- AI chat requests are now handled by the backend for better security
- Contact form submissions are processed by the backend with **Nodemailer email service**
- Rate limiting is implemented on the backend
- Input validation and sanitization are handled server-side
- **Professional email templates** with better delivery reliability 