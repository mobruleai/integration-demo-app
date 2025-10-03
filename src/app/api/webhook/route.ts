import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

// In-memory storage for demo purposes
// In production, use a database or cache
let completedSessionData: any = null;

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: Request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.MOBRULE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-mobrule-signature');

      if (!signature) {
        console.error('Missing webhook signature');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Handle different webhook events
    switch (body.event) {
      case 'interview_session.started':
        // Interview started - no action needed for now
        break;

      case 'interview_session.completed':
        // Extract the response UUID from the nested data structure
        const responseUuid = body.data?.response_uuid;

        if (!responseUuid) {
          console.error('No response UUID found in webhook body');
          return NextResponse.json({ received: true });
        }

        // Fetch the response data using the responses API
        const apiKey = process.env.MOBRULE_API_KEY;
        if (!apiKey) {
          console.error('Missing MOBRULE_API_KEY');
          return NextResponse.json({ received: true });
        }

        try {
          const responseData = await fetchResponseData(responseUuid, apiKey);
          completedSessionData = responseData;
        } catch (error) {
          console.error('Failed to fetch response data:', error);
        }
        break;

      default:
      // Unknown event type - ignore
    }

    // Always return 200 OK for webhook endpoints
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}

async function fetchResponseData(uuid: string, apiKey: string) {
  const apiBaseUrl = process.env.MOBRULE_API_BASE_URL || 'https://mobrule.ai';
  const response = await fetch(
    `${apiBaseUrl}/api/v1/responses/${uuid}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch response: ${response.status}`);
  }

  const data = await response.json();
  return data.data.response_data;
}

// GET endpoint to retrieve the completed session data
export async function GET(request: Request) {
  if (completedSessionData) {
    return NextResponse.json({
      completed: true,
      responseData: completedSessionData
    });
  }

  return NextResponse.json({ completed: false });
}