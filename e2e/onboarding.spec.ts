import { test, expect } from "@playwright/test";

test.describe("User Onboarding", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding
    await page.goto("/app/onboarding");
  });

  test("should progress through onboarding steps", async ({ page }) => {
    // Step 1: Identity
    await expect(page.locator("h2")).toContainText(/Step 1/i);
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 2: Handle
    await expect(page.locator("h2")).toContainText(/Step 2/i);
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 3: Context
    await expect(page.locator("h2")).toContainText(/Step 3/i);
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 4: Compliance (Verify SEBI disclosures)
    await expect(page.locator("h2")).toContainText(/Step 4/i);
    await expect(page.getByText(/Risk Disclosure on Derivatives/i)).toBeVisible();
    await expect(page.getByText(/9 out of 10/i)).toBeVisible();
    
    // Check boxes
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await checkboxes.nth(i).check();
    }
    await page.getByRole("button", { name: /Save and continue/i }).click();

    // Step 5: Checklist
    await expect(page.locator("h2")).toContainText(/Step 5/i);
    await expect(page.getByRole("button", { name: /Complete onboarding/i })).toBeVisible();
  });
});
