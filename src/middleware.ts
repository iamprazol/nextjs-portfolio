import { NextResponse, type NextRequest } from "next/server";

// The dev-only pages call notFound() in production, but the root loading.tsx
// wraps every page in a Suspense boundary, and a notFound() thrown inside one
// is served with status 200. Rewriting to a path that matches no route gives
// these URLs a real 404 before any page renders.
export function middleware(request: NextRequest) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return NextResponse.rewrite(new URL("/__dev-only", request.url));
}

export const config = {
    matcher: ["/_tokens", "/_ui", "/_data"]
};
