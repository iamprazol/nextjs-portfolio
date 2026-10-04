"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type TabItem = {
    id: string;
    label: string;
    panel: ReactNode;
};

type TabsProps = {
    tabs: TabItem[];
    /** Accessible name for the tab list. */
    label: string;
    defaultTab?: string;
    onChange?: (id: string) => void;
    className?: string;
};

// WAI-ARIA tabs with automatic activation: arrows / Home / End move focus and
// select. Every panel stays in the DOM (inactive ones are `hidden`).
export function Tabs({ tabs, label, defaultTab, onChange, className }: TabsProps) {
    const baseId = useId();
    const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const select = (index: number) => {
        const tab = tabs[index];
        setActive(tab.id);
        onChange?.(tab.id);
        tabRefs.current[index]?.focus();
    };

    const onKeyDown = (event: KeyboardEvent, index: number) => {
        const last = tabs.length - 1;
        const next = {
            ArrowRight: index === last ? 0 : index + 1,
            ArrowLeft: index === 0 ? last : index - 1,
            Home: 0,
            End: last
        }[event.key];

        if (next === undefined) return;
        event.preventDefault();
        select(next);
    };

    return (
        <div className={className}>
            <div
                role="tablist"
                aria-label={label}
                className="border-line flex overflow-x-auto border-b"
            >
                {tabs.map((tab, index) => {
                    const selected = tab.id === active;

                    return (
                        <button
                            key={tab.id}
                            ref={(node) => {
                                tabRefs.current[index] = node;
                            }}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${tab.id}`}
                            aria-selected={selected}
                            aria-controls={`${baseId}-panel-${tab.id}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => select(index)}
                            onKeyDown={(event) => onKeyDown(event, index)}
                            className={cn(
                                // -outline-offset keeps the ring inside the scroll container
                                "min-h-11 shrink-0 cursor-pointer border-b-2 px-4 font-mono text-sm whitespace-nowrap transition-colors focus-visible:-outline-offset-2",
                                selected
                                    ? "border-acc text-ink"
                                    : "text-mute hover:text-ink border-transparent"
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`${baseId}-panel-${tab.id}`}
                    aria-labelledby={`${baseId}-tab-${tab.id}`}
                    hidden={tab.id !== active}
                    tabIndex={0}
                    className="pt-6"
                >
                    {tab.panel}
                </div>
            ))}
        </div>
    );
}
