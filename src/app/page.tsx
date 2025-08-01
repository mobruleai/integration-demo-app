import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-6">Mob Rule Integration Demo</h1>
        <p className="text-muted-foreground mb-8 whitespace-pre-line">
          {`This demonstration nextjs app shows you how to integrate Mob Rule into your existing applications using Webhooks and API requests. It will demonstrate how to pre-authenticate interviews meaning your users do not need to enter their email address.

Use the .env document to set your API Key (get this from your mobrule.ai settings > api keys) and email address.`}
        </p>
        <Link href="/interview">
          <Button size="lg" className="gap-2">
            Start my interview
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}