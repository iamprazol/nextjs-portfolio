"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Status =
    | { type: "idle" }
    | { type: "sending" }
    | { type: "sent" }
    | { type: "failed"; message: string };

const EMPTY: Values = { name: "", email: "", message: "" };

const LIMITS: Record<Field, number> = { name: 100, email: 200, message: 5000 };

function validate(field: Field, raw: string): string | undefined {
    const value = raw.trim();
    switch (field) {
        case "name":
            return value ? undefined : "Enter your name.";
        case "email":
            if (!value) return "Enter your email address.";
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? undefined
                : "Enter a valid email address.";
        case "message":
            return value ? undefined : "Write a message.";
    }
}

const control =
    "border-line-2 bg-panel text-ink placeholder:text-mute w-full rounded-lg border px-3 text-base aria-[invalid=true]:border-ink";

/**
 * The contact form. Posts { name, email, message } to /api/contact, which
 * forwards it to the form service. Each field is checked when it is left and
 * again on submit; the result of sending is announced in a live region.
 */
export function ContactForm({ email }: { email: string | null }) {
    const id = useId();
    const [values, setValues] = useState<Values>(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [honeypot, setHoneypot] = useState("");
    const [status, setStatus] = useState<Status>({ type: "idle" });

    const set = (field: Field, value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        // Once a field has an error, re-check as the person fixes it.
        if (errors[field]) setErrors((current) => ({ ...current, [field]: validate(field, value) }));
    };
    const check = (field: Field) =>
        setErrors((current) => ({ ...current, [field]: validate(field, values[field]) }));

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        const found: Errors = {
            name: validate("name", values.name),
            email: validate("email", values.email),
            message: validate("message", values.message)
        };
        setErrors(found);
        const first = (["name", "email", "message"] as const).find((field) => found[field]);
        if (first) {
            form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
            return;
        }

        setStatus({ type: "sending" });
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    message: values.message.trim(),
                    company: honeypot
                })
            });
            if (!response.ok) {
                setStatus({
                    type: "failed",
                    message:
                        response.status === 429
                            ? "Too many messages from this connection. Please try again in an hour."
                            : "The message could not be sent."
                });
                return;
            }
            setValues(EMPTY);
            setStatus({ type: "sent" });
        } catch {
            setStatus({ type: "failed", message: "The message could not be sent. Check your connection." });
        }
    };

    const field = (name: Field, label: string, input: (props: Record<string, unknown>) => React.ReactNode) => {
        const error = errors[name];
        return (
            <div>
                <label htmlFor={`${id}-${name}`} className="text-ink-2 block font-mono text-sm">
                    {label}
                </label>
                <div className="mt-1.5">
                    {input({
                        id: `${id}-${name}`,
                        name,
                        value: values[name],
                        maxLength: LIMITS[name],
                        required: true,
                        "aria-invalid": error ? true : undefined,
                        "aria-describedby": error ? `${id}-${name}-error` : undefined,
                        onChange: (event: { target: { value: string } }) => set(name, event.target.value),
                        onBlur: () => check(name)
                    })}
                </div>
                {/*
                  * The line is always there. If an error appearing on blur moved
                  * the layout, a click on "Send message" would miss the button.
                  */}
                <p id={`${id}-${name}-error`} className="text-ink mt-1 min-h-5 text-sm font-medium">
                    {error}
                </p>
            </div>
        );
    };

    const sending = status.type === "sending";

    return (
        <form onSubmit={onSubmit} noValidate aria-label="Contact" className="space-y-2">
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {field("name", "Name", (props) => (
                    <input {...props} type="text" autoComplete="name" className={cn(control, "h-11")} />
                ))}
                {field("email", "Email", (props) => (
                    <input
                        {...props}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        className={cn(control, "h-11")}
                    />
                ))}
            </div>
            {field("message", "Message", (props) => (
                <textarea {...props} rows={6} className={cn(control, "min-h-32 resize-y py-2.5")} />
            ))}

            {/* Honeypot: off-screen and out of the tab order, so only bots fill it in. */}
            <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
                <label htmlFor={`${id}-company`}>Company</label>
                <input
                    id={`${id}-company`}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Button type="submit" disabled={sending}>
                    {sending ? "Sending…" : "Send message"}
                </Button>
                <p aria-live="polite" className="min-w-0 text-sm">
                    {status.type === "sent" && (
                        <span className="text-ink font-medium">
                            <span aria-hidden="true" className="text-ok">
                                ✓{" "}
                            </span>
                            Message sent. Thank you — I will reply by email.
                        </span>
                    )}
                    {status.type === "failed" && (
                        <span className="text-ink font-medium">
                            {status.message}
                            {email && (
                                <>
                                    {" "}
                                    You can also write to{" "}
                                    <a href={`mailto:${email}`} className="text-link break-all underline">
                                        {email}
                                    </a>
                                    .
                                </>
                            )}
                        </span>
                    )}
                </p>
            </div>
        </form>
    );
}
