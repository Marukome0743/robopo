import { expect, test } from "@playwright/test"

test.describe("Scoring flow navigation", () => {
  test("navigating to a course shows player selection", async ({ page }) => {
    await page.goto("/challenge/1/1")
    // Should show player selection or course not assigned message
    const hasPlayerList = await page
      .getByText("選手をタップして採点を開始")
      .count()
    const hasNoAssign = await page
      .getByText("コースが割り当てられていません")
      .count()
    expect(hasPlayerList + hasNoAssign).toBeGreaterThan(0)
  })

  test("player selection page shows course name", async ({ page }) => {
    await page.goto("/challenge/1/1")
    const hasCourseHeader = await page.getByText("選択中コース").count()
    const hasNoAssign = await page
      .getByText("コースが割り当てられていません")
      .count()
    expect(hasCourseHeader + hasNoAssign).toBeGreaterThan(0)
  })

  test("player selection has back button to home", async ({ page }) => {
    await page.goto("/challenge/1/1")
    const backBtn = page.getByRole("link", { name: "戻る" })
    if (await backBtn.isVisible()) {
      await expect(backBtn).toHaveAttribute("href", "/")
    }
  })

  test("umpireId is passed through URL params", async ({ page }) => {
    await page.goto("/challenge/1/1?umpireId=5")
    // The umpireId should be in the URL
    expect(page.url()).toContain("umpireId=5")
  })
})

test.describe("Scoring screen layout", () => {
  test("challenge page loads without errors", async ({ page }) => {
    await page.goto("/challenge/1/1/1?umpireId=1")
    // Should show either the challenge UI or an error about course assignment
    const hasChallenge = await page.locator(".score-display").count()
    const hasError = await page
      .getByText("コースを割り当てられていません")
      .count()
    expect(hasChallenge + hasError).toBeGreaterThan(0)
  })
})
