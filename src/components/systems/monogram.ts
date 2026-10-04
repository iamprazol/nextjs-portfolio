/** "Atlas Membership" → "AM", "relay-qa" → "RQ", "formkit" → "FO". */
export function monogram(name: string) {
    const words = name.split(/[\s\-_]+/).filter(Boolean);
    const letters = words.length > 1 ? words.slice(0, 2).map((word) => word[0]) : [name.slice(0, 2)];
    return letters.join("").toUpperCase();
}
