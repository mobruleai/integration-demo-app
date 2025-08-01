'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InterviewPage() {
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewWindow, setInterviewWindow] = useState<Window | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch pre-auth URL
  useEffect(() => {
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
        setVerificationUrl(data.verificationUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPreAuthUrl();
  }, []);

  // Check for completion in the background
  useEffect(() => {
    if (!interviewStarted) return;

    const checkCompletion = async () => {
      try {
        // Check if the interview window is closed
        if (interviewWindow && interviewWindow.closed) {
          console.log('Interview window was closed');
          window.location.href = '/completed';
          return;
        }

        // Also check webhook for completion
        const response = await fetch('/api/webhook');
        const data = await response.json();
        
        if (data.completed) {
          console.log('Interview completed via webhook');
          if (interviewWindow && !interviewWindow.closed) {
            interviewWindow.close();
          }
          window.location.href = '/completed';
        }
      } catch (error) {
        console.error('Error checking completion:', error);
      }
    };

    // Start checking after 5 seconds
    const timeout = setTimeout(() => {
      checkCompletion();
      // Then check every 3 seconds
      checkIntervalRef.current = setInterval(checkCompletion, 3000);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [interviewStarted, interviewWindow]);

  const startInterview = () => {
    if (verificationUrl) {
      console.log('Opening interview in new window:', verificationUrl);
      const newWindow = window.open(
        verificationUrl,
        'mobrule-interview',
        'width=1200,height=800,scrollbars=yes,resizable=yes'
      );
      
      if (newWindow) {
        setInterviewWindow(newWindow);
        setInterviewStarted(true);
        
        // Focus the new window
        newWindow.focus();
      } else {
        setError('Popup blocked. Please allow popups for this site and try again.');
      }
    }
  };

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

  if (interviewStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Interview Started</h2>
            <p className="text-muted-foreground mb-4">
              Your interview is running in a separate window. Please complete the interview there.
            </p>
            <p className="text-sm text-muted-foreground">
              This page will automatically redirect when the interview is completed.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => interviewWindow?.focus()} 
              variant="outline"
              disabled={!interviewWindow || interviewWindow.closed}
            >
              Focus Interview Window
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/completed'} 
              variant="ghost"
              size="sm"
            >
              Skip to Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Interview</h2>
        <p className="text-muted-foreground mb-6">
          Your interview will open in a new window. Make sure your browser allows popups from this site.
        </p>
        
        <Button onClick={startInterview} size="lg" className="gap-2">
          Start Interview
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}