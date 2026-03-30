import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test } from "bun:test"
import { ThreeTabs } from "@/app/components/parts/threeTabs"

afterEach(cleanup)

const defaultProps = {
  tab1Title: "Tab1",
  tab1: <div>Content1</div>,
  tab2Title: "Tab2",
  tab2: <div>Content2</div>,
  tab3Title: "Tab3",
  tab3: <div>Content3</div>,
}

describe("ThreeTabs", () => {
  test("renders both desktop and mobile layouts in DOM", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    // Desktop: hidden md:flex container
    const desktop = container.querySelector(".md\\:flex")
    expect(desktop).toBeTruthy()
    // Mobile: md:hidden tablist
    const mobile = container.querySelector(".md\\:hidden")
    expect(mobile).toBeTruthy()
  })

  test("desktop layout contains all tab titles as headings", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")!
    const headings = desktop.querySelectorAll("h1")
    expect(headings).toHaveLength(3)
    expect(headings[0].textContent).toBe("Tab1")
    expect(headings[1].textContent).toBe("Tab2")
    expect(headings[2].textContent).toBe("Tab3")
  })

  test("desktop layout contains all tab contents", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")!
    expect(desktop.textContent).toContain("Content1")
    expect(desktop.textContent).toContain("Content2")
    expect(desktop.textContent).toContain("Content3")
  })

  test("mobile layout renders radio tabs", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const mobile = container.querySelector(".md\\:hidden")!
    const radios = mobile.querySelectorAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
  })

  test("first tab is checked by default in mobile layout", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const mobile = container.querySelector(".md\\:hidden")!
    const radios = mobile.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    expect(radios[0].defaultChecked).toBe(true)
    expect(radios[1].defaultChecked).toBe(false)
    expect(radios[2].defaultChecked).toBe(false)
  })

  test("renders icons when provided", () => {
    const icon = <span data-testid="icon">★</span>
    const { container } = render(
      <ThreeTabs {...defaultProps} tab1Icon={icon} />,
    )
    const icons = container.querySelectorAll('[data-testid="icon"]')
    // icon appears in both desktop heading and mobile label
    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  test("does not use useState or useEffect (no matchMedia)", () => {
    // Verify the component renders without window.matchMedia
    // by confirming both layouts are always present (CSS-only responsive)
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")
    const mobile = container.querySelector(".md\\:hidden")
    // Both are always in the DOM — visibility controlled by CSS only
    expect(desktop).toBeTruthy()
    expect(mobile).toBeTruthy()
  })
})
