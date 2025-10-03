'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function InterviewPage() {
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchedRef = useRef(false);

  // Fetch pre-auth URL
  useEffect(() => {
    // Prevent double fetch in React Strict Mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchPreAuthUrl = async () => {
      try {
        const response = await fetch('/api/pre-authenticate', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get pre-authenticated URL');
        }

        const data = await response.json();
        console.log('Pre-auth response:', data);
        console.log('Verification URL:', data.verificationUrl);
        setVerificationUrl(data.verificationUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPreAuthUrl();
  }, []);

  // Listen for completion message from iframe
  useEffect(() => {
    if (!verificationUrl) return;

    const handleMessage = (event: MessageEvent) => {
      // Verify the origin matches the iframe URL
      const urlObj = new URL(verificationUrl);
      if (event.origin !== urlObj.origin) return;

      // Check for completion event
      if (event.data?.type === 'interview_completed' || event.data?.completed) {
        console.log('Interview completed via postMessage');
        window.location.href = '/completed';
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [verificationUrl]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading interview</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!verificationUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No verification URL received</p>
      </div>
    );
  }

  console.log('About to load iframe with URL:', verificationUrl);
  
  // Extract the origin from the verification URL
  const urlObj = new URL(verificationUrl);
  const iframeOrigin = urlObj.origin;
  console.log('Iframe origin:', iframeOrigin);
  
  return (
    <div className="fixed inset-0 bg-background">
      <iframe
        src={verificationUrl}
        className="w-full h-full border-0"
        title="Mob Rule Interview"
        allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
        referrerPolicy="origin"
        onLoad={() => {
          console.log('Iframe loaded successfully');
        }}
        onError={(e) => console.error('Iframe load error:', e)}
      />
    </div>
  );
}