import { expect, test } from "@playwright/test";

test("home page renders primary brand copy", async ({ page }) => {
  await page.goto("/");
  // Check for the new Inhumans branding
  await expect(page.getByText("Inhumans").first()).toBeVisible();
  await expect(page.getByText("Follow traders who prove it").first()).toBeVisible();
});
