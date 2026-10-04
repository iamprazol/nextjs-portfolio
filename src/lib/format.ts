const dateFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
});

/** "28 Sept 2026". UTC, so the server and every browser print the same thing. */
export function formatDate(iso: string) {
    return dateFormat.format(new Date(iso));
}
