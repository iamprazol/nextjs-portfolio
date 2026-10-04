"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";

type UrlState = {
    get: (key: string) => string | null;
    /** Sets or (with null) removes query parameters, without adding a history entry. */
    set: (updates: Record<string, string | null>) => void;
};

const Context = createContext<UrlState>({ get: () => null, set: () => {} });

/**
 * Query-string state for a statically rendered page.
 *
 * useSearchParams needs a Suspense boundary on a static page, and nothing in
 * that boundary's fallback may call it. So the page renders its content twice:
 * inside <UrlStateProvider> (live), and as the fallback inside
 * <StaticUrlState> (no parameters, for the prerendered HTML). Components read
 * the query through useUrlState() and work in both.
 */
export function UrlStateProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const get = useCallback((key: string) => params.get(key), [params]);
    const set = useCallback(
        (updates: Record<string, string | null>) => {
            const next = new URLSearchParams(params);
            for (const [key, value] of Object.entries(updates)) {
                if (value === null) next.delete(key);
                else next.set(key, value);
            }
            const query = next.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [params, pathname, router]
    );

    const value = useMemo(() => ({ get, set }), [get, set]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** The same content with no query parameters: the Suspense fallback. */
export function StaticUrlState({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function useUrlState() {
    return useContext(Context);
}
