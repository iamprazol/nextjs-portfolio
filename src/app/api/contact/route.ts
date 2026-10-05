import { NextResponse } from "next/server";

import { createRateLimiter } from "@/lib/rate-limit";

// Five messages an hour per address is plenty for a person and little for a script.
const checkRate = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

/** The caller's address as the proxy reports it (Vercel sets x-forwarded-for). */
function clientIp(req: Request) {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

type ApiErrorResponse = {
    message?: string;
    raw?: string;
};

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    return typeof value === "object" && value !== null;
}

export async function POST(req: Request) {
    try {
        const rate = checkRate(clientIp(req));
        if (!rate.allowed) {
            return NextResponse.json(
                { message: "Too many messages. Please try again later." },
                { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
            );
        }

        const { name, email, message, company } = await req.json();

        // `company` is the form's honeypot: people never see it, bots fill it
        // in. Answer as if it worked so the bot learns nothing, and drop it.
        if (company) {
            return NextResponse.json({ success: true });
        }

        if (!name || !email || !message) {
            return NextResponse.json(
                { message: "Missing fields" },
                { status: 400 }
            );
        }

        if (!process.env.WP_API_KEY) {
            return NextResponse.json(
                { message: "Missing WP_API_KEY on server" },
                { status: 500 }
            );
        }

        // Build URL-encoded body like: form_fields[KEY]=value&id=1792
        const body = new URLSearchParams();
        body.append("id", "1792");
        body.append("form_fields[LbH5NxasXM-2]", email);
        body.append("form_fields[ys0GeZISRs-1]", name);
        body.append("form_fields[yhGx3FOwr2-4]", message);

        const response = await fetch(
            "https://www.wpmake.net/wp-json/everest-forms/v1/entry/save",
            {
                method: "POST",
                redirect: "manual",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "x-api-key": process.env.WP_API_KEY || "",
                    "api-key": process.env.WP_API_KEY || ""
                },
                body: body.toString()
            }
        );

        const text = await response.text();

        let data: unknown = null;
        try {
            data = JSON.parse(text);
        } catch {
            data = { raw: text };
        }

        if (!response.ok) {
            const message =
                isApiErrorResponse(data) &&
                "message" in data &&
                typeof data.message === "string"
                    ? data.message
                    : isApiErrorResponse(data) &&
                      "raw" in data &&
                      typeof data.raw === "string"
                    ? data.raw
                    : "Submission failed";

            return NextResponse.json({ message }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("CONTACT ERROR", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
