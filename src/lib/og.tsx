import { ImageResponse } from "next/og";

// Social-card images. They are rendered to a PNG by next/og, outside the
// page's CSS, so the tokens cannot be read from globals.css: this is the dark
// theme (DESIGN-TOKENS.md) written out once, for these images only.
const dark = {
    bg: "#0a0d12",
    panel: "#0e131a",
    line: "#2a3442",
    chip: "#1a212b",
    ink: "#e6eaf0",
    ink2: "#b3bcc9",
    mute: "#8c96a6",
    acc: "#7aa7ff"
};

const statusColor: Record<string, string> = {
    production: "#4ade80",
    building: "#7aa7ff",
    active: "#5eead4",
    experiment: "#f5b451",
    maintenance: "#8c96a6"
};

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgCard = {
    /** Small line above the title, e.g. the site owner or the system name. */
    eyebrow: string;
    title: string;
    subtitle?: string | null;
    /** A system status: shown as a coloured dot with its label. */
    status?: { key: string; label: string } | null;
    /** Stack tags along the bottom; the first five are shown. */
    tags?: string[];
};

/** The shared 1200×630 card: eyebrow, title, subtitle, then status and stack. */
export function ogImage({ eyebrow, title, subtitle, status, tags = [] }: OgCard) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 72,
                    background: dark.bg,
                    color: dark.ink,
                    borderTop: `8px solid ${dark.acc}`
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: dark.mute, textTransform: "uppercase" }}>
                        <span style={{ color: dark.acc, marginRight: 16 }}>&gt;_</span>
                        {eyebrow}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            marginTop: 36,
                            fontSize: title.length > 48 ? 56 : 76,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: -1.5
                        }}
                    >
                        {title}
                    </div>
                    {subtitle && (
                        <div style={{ display: "flex", marginTop: 28, fontSize: 32, lineHeight: 1.35, color: dark.ink2 }}>
                            {subtitle.length > 150 ? `${subtitle.slice(0, 147).trimEnd()}…` : subtitle}
                        </div>
                    )}
                </div>

                {(status || tags.length > 0) && (
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, fontSize: 24 }}>
                        {status && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "10px 22px",
                                    borderRadius: 999,
                                    border: `2px solid ${dark.line}`,
                                    background: dark.panel,
                                    color: dark.ink2,
                                    textTransform: "uppercase",
                                    letterSpacing: 3
                                }}
                            >
                                <div
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 999,
                                        marginRight: 14,
                                        background: statusColor[status.key] ?? dark.mute
                                    }}
                                />
                                {status.label}
                            </div>
                        )}
                        {tags.slice(0, 5).map((tag) => (
                            <div
                                key={tag}
                                style={{
                                    display: "flex",
                                    padding: "10px 18px",
                                    borderRadius: 8,
                                    background: dark.chip,
                                    color: dark.ink2
                                }}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ),
        OG_SIZE
    );
}
