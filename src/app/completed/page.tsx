'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CompletedPage() {
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // Poll for completion status
    const checkCompletion = async () => {
      try {
        const response = await fetch('/api/webhook');

        if (!response.ok) {
          console.error('Failed to check completion status:', response.status);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Unexpected response type:', contentType);
          return;
        }

        const data = await response.json();

        if (data.completed && data.responseData) {
          setResponseData(data.responseData);
          setLoading(false);
          // Stop polling once we have the data
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        } else if (!interval) {
          // Only start polling if we don't have data yet and haven't started polling
          interval = setInterval(checkCompletion, 2000);
        }
      } catch (error) {
        console.error('Error checking completion:', error);
      }
    };

    // Check immediately - if data is there, we're done. If not, polling will start.
    checkCompletion();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Waiting for interview completion...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-6">All done!</h1>
        <p className="text-muted-foreground mb-8">
          You have received the <code className="bg-muted px-2 py-1 rounded text-sm">interview_session.completed</code> event. Here is the payload:
        </p>
        <div className="bg-muted p-4 rounded-lg text-left">
          <pre className="overflow-x-auto">
            <code className="text-sm">
              {JSON.stringify(responseData, null, 2)}
            </code>
          </pre>
        </div>
      </div>
    </main>
  );
}