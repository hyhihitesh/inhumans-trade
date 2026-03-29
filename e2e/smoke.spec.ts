import { expect, test } from "@playwright/test";

test("home page renders primary brand copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("INHUMANS.IO").first()).toBeVisible();
  await expect(page.getByText("The Trust Layer for").first()).toBeVisible();
});
