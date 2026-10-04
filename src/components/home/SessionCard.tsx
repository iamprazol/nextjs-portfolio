"use client";

import { useEffect, useState } from "react";

import { MonoLabel, Panel, RingGauge } from "@/components/ui";

type BatteryManager = {
    level: number;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
};

type Session = {
    /** Logical CPU cores, if the browser reports them. */
    cores: number | null;
    /** Approximate device memory in GB (Chromium only; the browser rounds and caps it). */
    memory: number | null;
    /** Battery level 0–1, where the Battery API exists. */
    battery: number | null;
};

const SCALE = 16;

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return minutes > 0 ? `${minutes}m ${rest}s` : `${seconds}s`;
}

/**
 * The visitor's own session, read live from their browser — not invented
 * server metrics. A row whose API the browser lacks is not rendered.
 */
export function SessionCard() {
    const [session, setSession] = useState<Session | null>(null);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const nav = navigator as Navigator & {
            deviceMemory?: number;
            getBattery?: () => Promise<BatteryManager>;
        };
        setSession({
            cores: nav.hardwareConcurrency || null,
            memory: nav.deviceMemory ?? null,
            battery: null
        });

        let battery: BatteryManager | undefined;
        let cancelled = false;
        const onLevel = () => {
            if (battery) setSession((current) => current && { ...current, battery: battery!.level });
        };
        nav.getBattery?.().then(
            (manager) => {
                if (cancelled) return;
                battery = manager;
                onLevel();
                manager.addEventListener("levelchange", onLevel);
            },
            () => {}
        );

        const started = Date.now();
        const timer = setInterval(() => {
            if (!document.hidden) setSeconds(Math.floor((Date.now() - started) / 1000));
        }, 1000);

        return () => {
            cancelled = true;
            clearInterval(timer);
            battery?.removeEventListener("levelchange", onLevel);
        };
    }, []);

    return (
        <Panel>
            <MonoLabel as="h2">Your session</MonoLabel>

            {/* min-h holds the space of the two rows every browser shows. */}
            <div className="mt-4 min-h-[5.5rem] space-y-4">
                {session && (
                    <>
                        {session.cores !== null && (
                            <RingGauge
                                layout="row"
                                value={session.cores / SCALE}
                                label="CPU cores"
                                readout={String(session.cores)}
                            />
                        )}
                        {session.memory !== null && (
                            <RingGauge
                                layout="row"
                                value={session.memory / SCALE}
                                label="Memory"
                                readout={`~${session.memory} GB`}
                            />
                        )}
                        {session.battery !== null && (
                            <RingGauge
                                layout="row"
                                value={session.battery}
                                label="Battery"
                                readout={`${Math.round(session.battery * 100)}%`}
                            />
                        )}
                        <RingGauge
                            layout="row"
                            // One turn of the ring per minute.
                            value={(seconds % 60) / 60}
                            label="Time here"
                            readout={formatDuration(seconds)}
                        />
                    </>
                )}
            </div>

            <p className="text-mute border-line mt-4 border-t pt-3 text-xs">
                Read live from your browser — nothing stored.
            </p>
        </Panel>
    );
}
