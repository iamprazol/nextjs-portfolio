"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shell/ErrorState";

import "./globals.css";

// Replaces the root layout when the layout itself fails — the nav and footer
// read GitHub too — so it has to render its own <html> and <body>.
export default function GlobalError({
    error
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en" className="dark">
            <body className="bg-bg text-ink">
                <title>GitHub is not responding</title>
                {/* reset() cannot re-run a failed layout; a reload can. */}
                <ErrorState onRetry={() => window.location.reload()} digest={error.digest} />
            </body>
        </html>
    );
}
