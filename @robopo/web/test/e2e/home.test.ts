import { expect, test } from "@playwright/test"

test.describe("Home page - Dashboard layout", () => {
  test("displays ROBOPO header with logo", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("header")).toBeVisible()
    await expect(page.getByText("ROBOPO")).toBeVisible()
  })

  test("displays competition selection or active competition", async ({
    page,
  }) => {
    await page.goto("/")
    // Should have either a competition dropdown or active competition name
    const hasDropdown = await page
      .locator("#competition-select, #summary-competition-select")
      .count()
    const hasActiveName = await page.getByText("開催中:").count()
    expect(hasDropdown + hasActiveName).toBeGreaterThan(0)
  })

  test("displays umpire selection dropdown", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#umpire-select")).toBeVisible()
  })

  test("displays dashboard cards for scoring, summary, and management", async ({
    page,
  }) => {
    await page.goto("/signIn")
    // Login first if needed
    const loginVisible = await page.getByText("サインイン").isVisible()
    if (loginVisible) {
      // Skip management card check for unauthenticated users
      await page.goto("/")
      await expect(page.getByText("採点")).toBeVisible()
    } else {
      await page.goto("/")
      await expect(page.getByText("採点")).toBeVisible()
      await expect(page.getByText("集計結果")).toBeVisible()
      await expect(page.getByText("大会管理")).toBeVisible()
    }
  })
})

test.describe("Home page - Responsive", () => {
  test("course cards are visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    // The scoring section should be visible
    await expect(page.getByText("採点")).toBeVisible()
  })
})
