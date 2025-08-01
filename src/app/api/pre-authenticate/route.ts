import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiBaseUrl = process.env.MOBRULE_API_BASE_URL || 'https://mobrule.ai';
  const apiKey = process.env.MOBRULE_API_KEY;
  const email = process.env.MOBRULE_EMAIL;
  const interviewUuid = process.env.MOBRULE_INTERVIEW_UUID;

  if (!apiKey || !email || !interviewUuid) {
    return NextResponse.json(
      { error: 'Missing required environment variables' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/interview-sessions/${interviewUuid}/pre-authenticate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          emails: [email],
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to pre-authenticate';
      try {
        const errorText = await response.text();
        if (errorText) {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        }
      } catch (e) {
        // If response is not JSON or empty, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      
      console.error('Pre-authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage
      });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the first URL since we're only sending one email
    const verificationUrl = data.urls[0]?.verification_url;
    
    if (!verificationUrl) {
      return NextResponse.json(
        { error: 'No verification URL received' },
        { status: 500 }
      );
    }

    return NextResponse.json({ verificationUrl });
  } catch (error) {
    console.error('Pre-authentication error:', error);
    return NextResponse.json(
      { error: 'Failed to pre-authenticate interview' },
      { status: 500 }
    );
  }
}