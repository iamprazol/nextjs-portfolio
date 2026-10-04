import { expect, test } from "@playwright/test";

// Mock fixtures: atlas-membership has two case studies. #1 (multi-membership)
// has before/after diagrams and every frontmatter list; #2 (checkout-race) has
// only a role, and cites PRs 409, 412 and a number that does not exist.

const first = "/systems/atlas-membership/problems/multi-membership";
const second = "/systems/atlas-membership/problems/checkout-race";

test.describe("engineering problem", () => {
    test("renders the article from the markdown file", async ({ page }) => {
        await page.goto(first);

        await expect(page).toHaveTitle(
            "Moving from single-membership to multi-membership · Atlas Membership — Demo Developer"
        );
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            "content",
            "The original model assumed one membership per user."
        );
        await expect(page.getByText("Engineering Problem #01")).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            "Moving from single-membership to multi-membership"
        );
        await expect(page.getByRole("link", { name: "Back to Atlas Membership" })).toHaveAttribute(
            "href",
            "/systems/atlas-membership?tab=problems"
        );

        // Markdown features made it through the sanitizer.
        const body = page.locator(".prose-lab");
        await expect(body.locator("blockquote")).toContainText("blocked by one column");
        await expect(body.locator("pre code")).toContainText("CREATE TABLE subscriptions");
        await expect(body.locator("ol li")).toHaveCount(2);
    });

    test("section chips jump to their headings", async ({ page }) => {
        await page.goto(first);
        const chips = page.getByRole("navigation", { name: "Sections" }).getByRole("link");
        await expect(chips).toHaveText(["The Problem", "The Decision", "The Result"]);

        await chips.nth(2).click();
        await expect(page).toHaveURL(/#the-result$/);
        await expect(page.locator("#the-result")).toBeInViewport();
    });

    test("shows before and after diagrams only when the frontmatter has them", async ({ page }) => {
        await page.goto(first);
        await expect(page.locator("figure")).toHaveCount(2);
        await expect(page.locator("figure").nth(0)).toContainText("The Old System");
        await expect(page.locator("figure").nth(1)).toContainText("Membership B");

        await page.goto(second);
        await expect(page.locator("figure")).toHaveCount(0);
    });

    test("aside shows only the panels the frontmatter fills", async ({ page }) => {
        await page.goto(first);
        const aside = page.getByRole("complementary", { name: "About this problem" });
        await expect(aside.locator("h2")).toHaveText([
            "My role",
            "Constraints",
            "Trade-offs",
            "Result",
            "Evidence"
        ]);

        await page.goto(second);
        await expect(aside.locator("h2")).toHaveText(["My role", "Evidence"]);
    });

    test("evidence lists the merged PRs it cites and links to the log", async ({ page }) => {
        await page.goto(second);
        const evidence = page
            .getByRole("complementary", { name: "About this problem" })
            .locator("section", { hasText: "Evidence" });

        // Newest first; the cited PR that does not exist is absent.
        await expect(evidence.locator("li")).toHaveCount(2);
        await expect(evidence.locator("li").first()).toContainText("Make webhook activation idempotent");
        await expect(evidence.locator("li").first()).toContainText("+240 −61");
        await expect(evidence.getByRole("link", { name: "Log #13" })).toHaveAttribute("href", "/log/13");
        await expect(evidence.getByRole("link", { name: "PR #412" })).toHaveAttribute(
            "href",
            "https://github.com/demo-labs/atlas-membership/pull/412"
        );
    });

    test("links to the previous and next problem of the same system", async ({ page }) => {
        await page.goto(first);
        const nav = page.getByRole("navigation", { name: "More problems" });
        await expect(nav.getByRole("link")).toHaveCount(1);
        await nav.getByRole("link", { name: /Next problem/ }).click();
        await expect(page).toHaveURL(new RegExp(`${second}$`));

        await expect(nav.getByRole("link")).toHaveCount(1);
        await expect(nav.getByRole("link", { name: /Previous problem/ })).toContainText(
            "Moving from single-membership"
        );

        // A system with a single case study has no such navigation.
        await page.goto("/systems/relay-qa/problems/flaky-selectors");
        await expect(page.getByRole("navigation", { name: "More problems" })).toHaveCount(0);
    });

    test("returns a real 404 for an unknown problem or system", async ({ page }) => {
        expect((await page.goto("/systems/atlas-membership/problems/nope"))?.status()).toBe(404);
        expect((await page.goto("/systems/nope/problems/multi-membership"))?.status()).toBe(404);
    });
});
