# Lanka Smart CRM - Marketing Backend

This backend provides marketing campaign management for the Lanka Smart CRM Hub. It allows creating, scheduling, and sending email and SMS campaigns to customer segments.

## Overview

The marketing backend exposes several API endpoints that provide marketing functionality for the frontend:

- `/api/marketing/campaigns` - Campaign management
- `/api/marketing/templates` - Template management
- `/api/marketing/integrations` - Integration management with third-party services

## Setup and Running

### Prerequisites

- Python 3.8+
- MongoDB running locally or accessible via connection string
- Required Python packages (see requirements.txt)
- SendGrid account (for email marketing)
- Twilio account (for SMS marketing)

### Installation

1. Run the setup script:
   ```
   setup.bat
   ```

   This will:
   - Create a virtual environment
   - Install required dependencies
   - Install SendGrid and Twilio SDKs

2. Configure your environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   SEGMENT_API_URL=http://localhost:5000/api/segments
   PORT=5001
   FLASK_ENV=development
   ```

### Running the Server

Run the server using:
```
start_server.bat
```

The server will start on port 5001 by default.

## Third-Party Integrations

### SendGrid (Email Marketing)

1. Create a free SendGrid account at [sendgrid.com](https://sendgrid.com/)
2. Verify your account and domain
3. Create an API Key with "Mail Send" permissions
4. Add the API Key to your integration settings in the CRM

#### SendGrid Integration Example

```json
{
  "name": "SendGrid Email",
  "provider": "sendgrid",
  "type": "email",
  "isActive": true,
  "credentials": {
    "apiKey": "SG.XXXXXXXXXXXXXXXXXXXX",
    "from": "marketing@yourdomain.com"
  }
}
```

### Twilio (SMS Marketing)

1. Create a Twilio account at [twilio.com](https://twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number or use a trial number
4. Add these credentials to your integration settings in the CRM

#### Twilio Integration Example

```json
{
  "name": "Twilio SMS",
  "provider": "twilio",
  "type": "sms",
  "isActive": true,
  "credentials": {
    "accountSid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "authToken": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "from": "+15551234567"
  }
}
```

## API Endpoints

### Campaign Management

- `GET /api/marketing/campaigns` - Get all campaigns
- `GET /api/marketing/campaigns/:id` - Get a specific campaign
- `POST /api/marketing/campaigns` - Create a new campaign
- `PUT /api/marketing/campaigns/:id` - Update a campaign
- `DELETE /api/marketing/campaigns/:id` - Delete a campaign
- `POST /api/marketing/campaigns/:id/schedule` - Schedule a campaign
- `POST /api/marketing/send-test` - Send a test message

### Template Management

- `GET /api/marketing/templates` - Get all templates
- `GET /api/marketing/templates/:id` - Get a specific template
- `POST /api/marketing/templates` - Create a new template
- `PUT /api/marketing/templates/:id` - Update a template
- `DELETE /api/marketing/templates/:id` - Delete a template

### Integration Management

- `GET /api/marketing/integrations` - Get all integrations
- `GET /api/marketing/integrations/:id` - Get a specific integration
- `POST /api/marketing/integrations` - Create a new integration
- `PUT /api/marketing/integrations/:id` - Update an integration
- `DELETE /api/marketing/integrations/:id` - Delete an integration
- `POST /api/marketing/test-integration` - Test an integration

## Troubleshooting

### SendGrid Issues

1. **Authentication Errors**: Ensure your API key has the correct permissions and is correctly entered
2. **Sender Verification**: Make sure your sender email is verified in SendGrid
3. **Rate Limiting**: Free accounts have limits on daily email sends

### Twilio Issues

1. **Authentication Errors**: Double-check your Account SID and Auth Token
2. **Phone Number Format**: Ensure phone numbers are in E.164 format (e.g., +15551234567)
3. **Trial Limitations**: Trial accounts can only send to verified numbers

## Contact

For questions or issues, please contact the development team.
