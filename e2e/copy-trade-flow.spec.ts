import { expect, test } from "@playwright/test";

const followerEmail = process.env.E2E_FOLLOWER_EMAIL;
const followerPassword = process.env.E2E_FOLLOWER_PASSWORD;

test("follower can submit copy-trade and see it in portfolio", async ({ page }) => {
  test.skip(!followerEmail || !followerPassword, "Set E2E_FOLLOWER_EMAIL and E2E_FOLLOWER_PASSWORD to run this test.");

  await page.goto("/auth/sign-in?next=/app/follower-feed");
  await page.getByPlaceholder("Email").fill(followerEmail as string);
  await page.getByPlaceholder("Password").fill(followerPassword as string);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app\/follower-feed/);

  const copyCta = page.getByTestId("copy-trade-cta").first();
  await expect(copyCta).toBeVisible();
  await copyCta.click();

  await expect(page.getByTestId("copy-trade-sheet")).toBeVisible();
  await page.getByTestId("copy-trade-quantity").fill("3");
  await page.getByTestId("copy-trade-risk").fill("2");
  await page.getByTestId("copy-trade-capital").fill("15000");
  await page.getByTestId("copy-trade-confirm").click();

  const message = page.getByTestId("copy-trade-message");
  await expect(message).toContainText("Copy request created");

  await page.goto("/app/portfolio");
  await expect(page.getByRole("heading", { name: "Copy Trade Tracker" })).toBeVisible();

  // Newly submitted request should be visible with a non-empty status cell.
  const statusCell = page.locator("tbody tr").first().locator("td").nth(4);
  await expect(statusCell).toHaveText(/pending|submitted|executed|failed|skipped/i);
});

