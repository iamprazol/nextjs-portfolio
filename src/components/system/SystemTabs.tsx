"use client";

import { useUrlState } from "@/components/shell/url-state";
import { Tabs, type TabItem } from "@/components/ui";

/** The profile's tabs, with the selection kept in ?tab= so a tab can be linked to. */
export function SystemTabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
    const url = useUrlState();
    const requested = url.get("tab");
    // An unknown or absent value means the first tab.
    const active = tabs.find((tab) => tab.id === requested)?.id ?? tabs[0].id;

    return (
        <Tabs
            tabs={tabs}
            label={label}
            value={active}
            onChange={(id) =>
                // The first tab is the default, so it needs no parameter; a
                // selected diagram node only makes sense on its own tab.
                url.set({ tab: id === tabs[0].id ? null : id, node: null })
            }
        />
    );
}
