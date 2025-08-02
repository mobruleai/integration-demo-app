# Mob Rule Integration Demo

This Next.js application demonstrates how to integrate Mob Rule's interview platform into your existing applications using webhooks and API requests. It showcases a pre-authentication flow where users don't need to enter their email address, creating a seamless experience.

## Features

- **Pre-authenticated interviews**: Users bypass email verification through server-side authentication
- **Webhook integration**: Receive real-time events when interviews start and complete
- **Automatic data retrieval**: Fetch interview responses when completed
- **New window integration**: Opens interviews in separate windows to avoid session conflicts

## Prerequisites

- Node.js 18+ installed
- A Mob Rule account with:
  - API access enabled
  - An API key (found in Settings > API Keys)
  - An interview UUID to embed
  - A webhook secret (provided when registering webhooks)
- A public URL for webhook endpoints (use [ngrok](https://ngrok.com/) for local development)

## Quick Start

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.local.example` to `.env.local` (or create `.env.local`) and add:

   ```env
   MOBRULE_API_BASE_URL=https://app.mobrule.ai
   MOBRULE_API_KEY=your_api_key_here
   MOBRULE_EMAIL=your_email@example.com
   MOBRULE_INTERVIEW_UUID=your_interview_uuid_here
   MOBRULE_WEBHOOK_SECRET=your_webhook_secret_here
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   If you're using a development API with self-signed certificates:

   ```bash
   npm run dev:insecure
   # or manually: NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
   ```

4. **Set up webhook endpoint (for local development):**

   If running locally, use ngrok to expose your webhook:

   ```bash
   # For a single tunnel:
   ngrok http 3000

   # For multiple tunnels (if you have services on both 3000 and 3001):
   # First, add your authtoken to ngrok.yml
   # Then run:
   ngrok start --all --config=ngrok.yml
   ```

   Then register the webhook URL in Mob Rule:

   - Go to your Mob Rule dashboard
   - Navigate to Settings > Webhooks
   - Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`
   - Select events: `interview_session.started` and `interview_session.completed`
   - Copy the webhook secret provided and add it to your `.env.local`

## How It Works

### Page Flow

1. **Home Page (`/`)**:

   - Displays welcome message and instructions
   - "Start my interview" button initiates the flow

2. **Interview Page (`/interview`)**:

   - Calls the pre-authentication API to get a verified URL
   - Opens the Mob Rule interview in a new window/tab
   - Monitors both window closure and webhook status for completion
   - Auto-redirects to completion page when finished

3. **Completed Page (`/completed`)**:
   - Shows when the interview is completed
   - Displays the response data received via webhook

### API Integration

#### Pre-Authentication Flow

When a user clicks "Start my interview", the app:

1. Makes a request to `/api/pre-authenticate`
2. The API route uses your Mob Rule API key to request a pre-authenticated URL
3. The email from your environment variables is used for authentication
4. Returns a verification URL that bypasses email entry

```javascript
POST https://app.mobrule.ai/api/v1/interview-sessions/{uuid}/pre-authenticate
Body: { "emails": ["user@example.com"] }
```

#### Webhook Events

The app listens for two webhook events:

- **`interview_session.started`**: Logged when the interview begins
- **`interview_session.completed`**: Triggers fetching of response data

All webhook requests are verified using HMAC-SHA256 signatures to ensure they're from Mob Rule.

When the completed event is received, the webhook endpoint automatically fetches the full response data:

```javascript
GET https://app.mobrule.ai/api/v1/responses/{uuid}
```

### Technical Architecture

- **Next.js App Router**: Provides server-side API route protection
- **API Routes**: Keep your Mob Rule API key secure on the server
- **Client Components**: Handle dynamic UI updates and iframe embedding
- **Polling Strategy**: Checks for completion status to provide real-time updates

## Environment Variables

| Variable                 | Description                               | Example              |
| ------------------------ | ----------------------------------------- | -------------------- |
| `MOBRULE_API_BASE_URL`   | Base URL for Mob Rule API                 | `https://mobrule.ai` |
| `MOBRULE_API_KEY`        | Your Mob Rule API key                     | `mob_live_abc123...` |
| `MOBRULE_EMAIL`          | Email for pre-authentication              | `user@example.com`   |
| `MOBRULE_INTERVIEW_UUID` | UUID of the interview to embed            | `550e8400-e29b...`   |
| `MOBRULE_WEBHOOK_SECRET` | Secret for webhook signature verification | `iuhdeiuhediuhe`     |

## Development Tips

### Testing Webhooks Locally

1. Install ngrok: `brew install ngrok` (macOS) or download from [ngrok.com](https://ngrok.com)
2. Start your Next.js app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL for webhook registration

### Debugging Webhooks

The webhook endpoint logs all received events to the console. Check your terminal for:

- Event types received
- Response data fetched
- Any errors during processing

### Production Deployment

When deploying to production:

1. Update webhook URLs in Mob Rule dashboard to your production domain
2. Ensure environment variables are set in your hosting platform
3. Consider using a database or Redis for storing session data (instead of in-memory storage)

## Common Issues

**Q: The interview page shows a loading spinner forever**

- Check that your API key and interview UUID are correct
- Verify the interview is active in your Mob Rule dashboard

**Q: Webhooks aren't being received**

- Ensure your webhook URL is publicly accessible
- Check that events are enabled in Mob Rule webhook settings
- Look for webhook logs in your Mob Rule dashboard

**Q: "Missing required environment variables" error**

- Ensure all environment variables are set in `.env.local`
- Restart your development server after adding variables

**Q: Popup blocked when starting interview**

Modern browsers may block popups by default. Solutions:

- Allow popups for your domain in browser settings
- Inform users to enable popups before starting
- Consider using a direct redirect instead of opening a new window

**Q: Interview window closed accidentally**

Users can use the "Focus Interview Window" button to return to the interview, or use "Skip to Results" if they've completed it.

## Next Steps

This demo provides a foundation for integration. Consider extending it with:

- Database storage for webhook data
- Multiple interview support
- Custom styling for the completed page
- Error recovery and retry logic
- User authentication integration

## Support

For issues with:

- This demo app: Open an issue in this repository
- Mob Rule API: Contact support@mobrule.ai
- API Documentation: Visit [app.mobrule.ai/developers/api-docs](https://app.mobrule.ai/developers/api-docs)
