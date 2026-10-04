import { cn } from "@/lib/cn";

import { MonoLabel } from "./MonoLabel";

type RingGaugeProps = {
    /** 0–1. Values outside the range are clamped. */
    value: number;
    label: string;
    /** Text in the middle of the ring, e.g. "72%". */
    readout: string;
    /** Diameter in px. */
    size?: number;
    /**
     * "stacked": readout inside the ring, label below (default).
     * "row": a small ring with label and readout beside it, for lists.
     */
    layout?: "stacked" | "row";
    className?: string;
};

const STROKE = 6;
const ROW_STROKE = 4;

export function RingGauge({
    value,
    label,
    readout,
    size,
    layout = "stacked",
    className
}: RingGaugeProps) {
    const row = layout === "row";
    size ??= row ? 36 : 96;
    const clamped = Math.min(1, Math.max(0, value));
    const stroke = row ? ROW_STROKE : STROKE;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const ring = (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 shrink-0"
            aria-hidden="true"
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={stroke}
                className="stroke-line-2"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - clamped)}
                className="stroke-acc"
            />
        </svg>
    );

    if (row) {
        return (
            <div
                role="img"
                aria-label={`${label}: ${readout}`}
                className={cn("flex items-center gap-3", className)}
            >
                {ring}
                <MonoLabel aria-hidden="true" className="min-w-0 flex-1 truncate">
                    {label}
                </MonoLabel>
                <span aria-hidden="true" className="text-ink font-mono text-sm tabular-nums">
                    {readout}
                </span>
            </div>
        );
    }

    return (
        <div
            role="img"
            aria-label={`${label}: ${readout}`}
            className={cn("inline-flex flex-col items-center gap-2", className)}
        >
            <div className="relative" style={{ width: size, height: size }}>
                {ring}
                <span
                    aria-hidden="true"
                    className="text-ink absolute inset-0 flex items-center justify-center font-mono text-lg"
                >
                    {readout}
                </span>
            </div>
            <MonoLabel aria-hidden="true">{label}</MonoLabel>
        </div>
    );
}
