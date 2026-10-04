import type { SystemStatus } from "@/lib/github/schemas";

export type { SystemStatus };

export const statusLabel: Record<SystemStatus, string> = {
    production: "Production",
    building: "Building",
    active: "Active",
    experiment: "Experiment",
    maintenance: "Maintenance"
};

// Status → color, from DESIGN-TOKENS.md. Full class names so Tailwind sees them.
export const statusDotClass: Record<SystemStatus, string> = {
    production: "bg-ok",
    building: "bg-acc",
    active: "bg-teal",
    experiment: "bg-violet",
    maintenance: "bg-mute"
};
