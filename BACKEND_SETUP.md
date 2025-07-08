# Backend Setup for Portfolio Integration

## Environment Variables Required

Create a `.env` file in the `himanshu-blog-backend` directory with the following variables:

### Database Configuration
```
MONGO_URI=mongodb://localhost:27017/blog
```

### Server Configuration
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Email Configuration (Nodemailer - for server-side email)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Himanshu Chaudhary
CONTACT_EMAIL=himanshu.c.official@gmail.com
```

### AI Configuration (Mistral API)
```
MISTRAL_API_KEY=your-mistral-api-key-here
```

## Frontend Configuration

In your portfolio project, add to `.env`:

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

For production, update to your deployed backend URL.

## API Endpoints Added

### AI Chat
- **POST** `/api/ai/chat` - Generate AI responses
- **GET** `/api/ai/health` - Check AI service health

### Contact Form
- **POST** `/api/contact/submit` - Submit contact form
- **GET** `/api/contact/health` - Check email service health

## Rate Limiting

- AI requests: 10 per minute per IP
- Contact form: 3 submissions per 5 minutes per IP

## Testing

1. Start the backend: `cd himanshu-blog-backend && npm run dev`
2. Start the portfolio: `cd himanshu-portfolio && npm start`
3. Test chat functionality and contact form

## Email Configuration

The backend uses **Nodemailer for server-side email delivery** since EmailJS blocks non-browser applications. This provides:
- Reliable server-side email sending
- Direct SMTP integration
- Better error handling and logging
- Support for Gmail App Passwords

**Note**: You'll need to set up a Gmail App Password for EMAIL_PASSWORD (not your regular Gmail password).

## Security Features

- Input validation and sanitization
- Rate limiting
- CORS protection
- XSS protection
- MongoDB injection protection 