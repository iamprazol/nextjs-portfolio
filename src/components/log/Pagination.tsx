import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

type PaginationProps = {
    page: number;
    pages: number;
    /** Builds the URL of a page, keeping any filter in the query string. */
    href: (page: number) => string;
};

const link =
    "border-line-2 text-ink hover:border-acc-line inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-mono text-sm transition-colors";

export function Pagination({ page, pages, href }: PaginationProps) {
    if (pages <= 1) return null;

    return (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
            {page > 1 ? (
                <Link href={href(page - 1)} rel="prev" className={link}>
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Newer
                </Link>
            ) : (
                <span />
            )}
            <p className="text-mute font-mono text-xs" aria-current="page">
                Page {page} of {pages}
            </p>
            {page < pages ? (
                <Link href={href(page + 1)} rel="next" className={link}>
                    Older
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            ) : (
                <span />
            )}
        </nav>
    );
}
