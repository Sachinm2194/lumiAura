"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ErrorDisplayProps {
  reset: () => void;
  error?: Error & { digest?: string };
  customMessage?: string;
}

export default function ErrorDisplay({
  reset,
  error,
  customMessage,
}: ErrorDisplayProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      reset();
      setIsResetting(false);
    }, 1000);
  };

  const copyErrorDetails = async () => {
    const details = `
Error: ${error?.message || "Unknown error"}
Digest: ${error?.digest || "N/A"}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-58px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-red-100">
        <CardHeader className="text-center pb-10">
          <div className="mx-auto mb-3 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600 animate-pulse" />
          </div>
          <CardTitle className="text-xl font-semibold text-red-700">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-red-500 text-sm">
            Try again or go back to the homepage.
          </CardDescription>
          {customMessage && (
            <div className="text-sm text-muted-foreground text-center mt-1">
              {customMessage}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
              size="lg"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          {error && (
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full justify-between text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <span>Error Details</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {showDetails && (
                <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-muted rounded-lg p-3 text-sm text-foreground">
                    <div className="font-medium mb-1">Message:</div>
                    <div className="text-muted-foreground">{error.message}</div>
                  </div>

                  {error.digest && (
                    <div className="bg-muted rounded-lg p-3 text-sm">
                      <div className="font-medium mb-1">Error ID:</div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {error.digest}
                      </Badge>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyErrorDetails}
                    className="w-full cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Error Details
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
