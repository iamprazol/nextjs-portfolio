import { expect, test } from "@playwright/test";

// The form posts to /api/contact. The UI tests answer that request themselves.
// The API tests call the real route, so they only ever send requests it turns
// away before the form service (a filled honeypot, missing fields): a complete
// message would be delivered for real wherever WP_API_KEY is set.

test.describe("contact form", () => {
    const fill = async (page: import("@playwright/test").Page) => {
        const form = page.getByRole("form", { name: "Contact" });
        await form.getByLabel("Name").fill("Ada Example");
        await form.getByLabel("Email").fill("ada@example.com");
        await form.getByLabel("Message").fill("Hello there.");
        return form;
    };

    test("has labelled fields that are at least 44px tall", async ({ page }) => {
        await page.goto("/about#contact");
        const form = page.getByRole("form", { name: "Contact" });
        for (const label of ["Name", "Email", "Message"]) {
            const box = await form.getByLabel(label).boundingBox();
            expect(box?.height, label).toBeGreaterThanOrEqual(44);
        }
        expect((await form.getByRole("button", { name: "Send message" }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
    });

    test("validates inline and does not send an incomplete form", async ({ page }) => {
        let requests = 0;
        await page.route("**/api/contact", (route) => {
            requests++;
            return route.fulfill({ json: { success: true } });
        });
        await page.goto("/about#contact");
        const form = page.getByRole("form", { name: "Contact" });

        // Leaving a field checks it.
        await form.getByLabel("Email").fill("not-an-email");
        await form.getByLabel("Message").focus();
        await expect(form.getByText("Enter a valid email address.")).toBeVisible();
        await expect(form.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");

        // Fixing it clears the error as you type.
        await form.getByLabel("Email").fill("ada@example.com");
        await expect(form.getByText("Enter a valid email address.")).toHaveCount(0);

        // Submitting reports every empty field and focuses the first. An error
        // appearing as the email field is left must not move the button away.
        await form.getByLabel("Email").fill("still-wrong");
        await form.getByRole("button", { name: "Send message" }).click();
        await expect(form.getByText("Enter a valid email address.")).toBeVisible();
        await form.getByLabel("Email").fill("ada@example.com");
        await form.getByRole("button", { name: "Send message" }).click();
        await expect(form.getByText("Enter your name.")).toBeVisible();
        await expect(form.getByText("Write a message.")).toBeVisible();
        await expect(form.getByLabel("Name")).toBeFocused();
        await expect(form.getByLabel("Name")).toHaveAccessibleDescription("Enter your name.");
        expect(requests).toBe(0);
    });

    test("sends name, email and message, then confirms and clears", async ({ page }) => {
        let body: unknown;
        await page.route("**/api/contact", (route) => {
            body = route.request().postDataJSON();
            return route.fulfill({ json: { success: true } });
        });
        await page.goto("/about#contact");
        const form = await fill(page);

        await form.getByRole("button", { name: "Send message" }).click();
        const status = form.locator("[aria-live='polite']");
        await expect(status).toContainText("Message sent.");
        expect(body).toEqual({ name: "Ada Example", email: "ada@example.com", message: "Hello there.", company: "" });
        await expect(form.getByLabel("Message")).toHaveValue("");
    });

    test("keeps what was typed and offers the email address when sending fails", async ({ page }) => {
        await page.route("**/api/contact", (route) => route.fulfill({ status: 500, json: { message: "Server error" } }));
        await page.goto("/about#contact");
        const form = await fill(page);

        await form.getByRole("button", { name: "Send message" }).click();
        const status = form.locator("[aria-live='polite']");
        await expect(status).toContainText("The message could not be sent.");
        await expect(status.getByRole("link", { name: "demo@demo-dev.example" })).toHaveAttribute(
            "href",
            "mailto:demo@demo-dev.example"
        );
        await expect(form.getByLabel("Message")).toHaveValue("Hello there.");
    });

    test("explains a rate limit", async ({ page }) => {
        await page.route("**/api/contact", (route) => route.fulfill({ status: 429, json: { message: "Too many" } }));
        await page.goto("/about#contact");
        const form = await fill(page);

        await form.getByRole("button", { name: "Send message" }).click();
        await expect(form.locator("[aria-live='polite']")).toContainText("Too many messages from this connection.");
    });

    test("hides the honeypot from people", async ({ page }) => {
        await page.goto("/about#contact");
        const honeypot = page.locator("input[name='company']");
        await expect(honeypot).toHaveAttribute("tabindex", "-1");
        await expect(honeypot).not.toBeInViewport();
        await expect(page.getByRole("textbox", { name: "Company" })).toHaveCount(0);
    });
});

test.describe("contact api", () => {
    // The limiter remembers addresses for an hour, so each run uses its own.
    const address = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}-${Date.now()}`;
    const message = { name: "Ada", email: "ada@example.com", message: "Hello" };
    // Rejected with 400 before anything is forwarded.
    const incomplete = { name: "Ada" };

    test("accepts a filled honeypot without forwarding it", async ({ request }) => {
        const response = await request.post("/api/contact", {
            headers: { "x-forwarded-for": address() },
            data: { ...message, company: "Spam Ltd" }
        });
        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ success: true });
    });

    test("still rejects a message with missing fields", async ({ request }) => {
        const response = await request.post("/api/contact", {
            headers: { "x-forwarded-for": address() },
            data: incomplete
        });
        expect(response.status()).toBe(400);
    });

    test("allows five requests an hour per address", async ({ request }) => {
        const headers = { "x-forwarded-for": address() };
        for (let i = 0; i < 5; i++) {
            const response = await request.post("/api/contact", { headers, data: incomplete });
            expect(response.status(), `request ${i + 1}`).toBe(400);
        }

        const blocked = await request.post("/api/contact", { headers, data: incomplete });
        expect(blocked.status()).toBe(429);
        expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(3500);

        // Another address is not affected.
        const other = await request.post("/api/contact", { headers: { "x-forwarded-for": address() }, data: incomplete });
        expect(other.status()).toBe(400);
    });
});
