"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui";

/** Opens the browser's print dialog, where "Save as PDF" produces the file. */
export function PrintButton() {
    return (
        <Button arrow={false} onClick={() => window.print()} className="print:hidden">
            <Download aria-hidden="true" className="size-4 shrink-0" />
            Download PDF
        </Button>
    );
}
