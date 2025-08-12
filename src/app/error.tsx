"use client";

import ErrorDisplay from "@/components/core-components/error-display";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorDisplay
      reset={reset}
      error={error}
      customMessage="Something went wrong while loading the Application. Please try again or check your network."
    />
  );
}
