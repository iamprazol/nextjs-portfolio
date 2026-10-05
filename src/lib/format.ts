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

const countFormat = new Intl.NumberFormat("en-US");

/** "1,456". A fixed locale, so the server and every browser print the same thing. */
export function formatCount(value: number) {
    return countFormat.format(value);
}
