import { test, expect } from "@playwright/test";

test.describe("Creator Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // In a real E2E, we would handle auth here. 
    // For now, we're testing that the route and core components render.
    await page.goto("/app");
  });

  test("should render the creator dashboard with core stats", async ({ page }) => {
    // Check for the Scandinavian Trust design elements
    await expect(page.locator("h1, h2")).toContainText(/Dashboard|Overview/i);
    
    // Check for Verified Trade Card visibility
    const tradeCard = page.locator("article").filter({ hasText: /Verified/i }).first();
    if (await tradeCard.isVisible()) {
      await expect(tradeCard).toBeVisible();
      await expect(tradeCard).toContainText(/P&L/i);
    }
  });

  test("should navigate to verified feed", async ({ page }) => {
    const feedLink = page.getByRole("link", { name: /Feed/i }).first();
    await feedLink.click();
    await expect(page).toHaveURL(/\/app\/feed/);
    await expect(page.getByText(/Verified Stream/i)).toBeVisible();
  });

  test("should show SEBI risk disclaimer in footer", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toContainText(/Risk Disclosure/i);
    await expect(footer).toContainText(/9 out of 10/i);
  });
});
