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
    className?: string;
};

const STROKE = 6;

export function RingGauge({
    value,
    label,
    readout,
    size = 96,
    className
}: RingGaugeProps) {
    const clamped = Math.min(1, Math.max(0, value));
    const radius = (size - STROKE) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div
            role="img"
            aria-label={`${label}: ${readout}`}
            className={cn("inline-flex flex-col items-center gap-2", className)}
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="-rotate-90"
                    aria-hidden="true"
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={STROKE}
                        className="stroke-line-2"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - clamped)}
                        className="stroke-acc"
                    />
                </svg>
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
