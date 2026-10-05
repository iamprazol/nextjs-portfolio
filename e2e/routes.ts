// Every kind of page the site has, in the mock fixtures. Shared by the
// accessibility and smoke suites so a new route is added in one place.
export const ROUTES = [
    "/",
    "/systems",
    "/systems/atlas-membership",
    "/systems/atlas-membership?tab=architecture&node=payments",
    "/systems/atlas-membership?tab=problems",
    "/systems/atlas-membership?tab=releases",
    "/systems/relay-qa?tab=workflow",
    "/systems/atlas-membership/problems/checkout-race",
    "/log",
    "/log/23",
    "/timeline",
    "/timeline?year=2024",
    "/lab",
    "/about",
    "/resume",
    "/this-page-does-not-exist"
] as const;

export const THEMES = ["dark", "light"] as const;
