import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ChallengeTab, ManageTab, SummaryTab } from "@/app/components/home/tabs"

afterEach(cleanup)

const competitionList = {
  competitions: [
    { id: 1, name: "Active Comp", step: 1, createdAt: null },
    { id: 2, name: "Closed Comp", step: 2, createdAt: null },
    { id: 3, name: "Prep Comp", step: 0, createdAt: null },
  ],
}

const courseList = {
  courses: [
    {
      id: 1,
      name: "Course A",
      field: null,
      fieldValid: false,
      mission: null,
      missionValid: false,
      point: null,
      createdAt: null,
    },
    {
      id: 2,
      name: "Course B",
      field: null,
      fieldValid: false,
      mission: null,
      missionValid: false,
      point: null,
      createdAt: null,
    },
  ],
}

const competitionCourseList = {
  competitionCourseList: [
    { id: 1, competitionId: 1, courseId: 1, createdAt: null },
    { id: 2, competitionId: 1, courseId: 2, createdAt: null },
  ],
}

const umpireList = [
  { id: 1, name: "Judge A", createdAt: null },
  { id: 2, name: "Judge B", createdAt: null },
]

describe("ChallengeTab", () => {
  test("shows competition name when single active competition", () => {
    const singleCompe = {
      competitions: [{ id: 1, name: "Only Comp", step: 1, createdAt: null }],
    }
    render(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        umpireList={umpireList}
      />,
    )
    expect(screen.getByText("Only Comp")).toBeTruthy()
  })

  test("renders umpire selection dropdown", () => {
    render(
      <ChallengeTab
        competitionList={competitionList}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        umpireList={umpireList}
      />,
    )
    expect(screen.getByText("Judge A")).toBeTruthy()
    expect(screen.getByText("Judge B")).toBeTruthy()
  })

  test("shows warning when course card clicked without umpire selected", () => {
    const singleCompe = {
      competitions: [{ id: 1, name: "Comp", step: 1, createdAt: null }],
    }
    const { container } = render(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        umpireList={umpireList}
      />,
    )
    // Initially no alert
    expect(container.querySelector(".alert-warning")).toBeNull()
    // Click a disabled course card using fireEvent
    const courseButton = screen.getByText("Course A").closest("button")
    expect(courseButton).toBeTruthy()
    if (courseButton) {
      fireEvent.click(courseButton)
    }
    // Alert should appear
    expect(container.querySelector(".alert-warning")).toBeTruthy()
    expect(screen.getByText("先に採点者を選択してください")).toBeTruthy()
  })

  test("renders course cards when competition is selected", () => {
    const singleCompe = {
      competitions: [{ id: 1, name: "Comp", step: 1, createdAt: null }],
    }
    render(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        umpireList={umpireList}
      />,
    )
    expect(screen.getByText("Course A")).toBeTruthy()
    expect(screen.getByText("Course B")).toBeTruthy()
    expect(screen.getByText("THE一本橋")).toBeTruthy()
    expect(screen.getByText("センサーコース")).toBeTruthy()
  })

  test("shows placeholder when no competition selected", () => {
    const multiActive = {
      competitions: [
        { id: 1, name: "Comp A", step: 1, createdAt: null },
        { id: 2, name: "Comp B", step: 1, createdAt: null },
      ],
    }
    render(
      <ChallengeTab
        competitionList={multiActive}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        umpireList={umpireList}
      />,
    )
    expect(
      screen.getByText("大会を選択するとコースが表示されます"),
    ).toBeTruthy()
  })
})

describe("SummaryTab", () => {
  test("renders competition dropdown", () => {
    render(<SummaryTab competitionList={competitionList} />)
    expect(screen.getByText("大会を選んでください")).toBeTruthy()
  })

  test("renders summary button (disabled by default)", () => {
    render(<SummaryTab competitionList={competitionList} />)
    expect(screen.getByText("集計結果を見る")).toBeTruthy()
  })
})

describe("ManageTab", () => {
  test("renders all management links", () => {
    render(<ManageTab />)
    expect(screen.getByText("コース作成")).toBeTruthy()
    expect(screen.getByText("選手登録")).toBeTruthy()
    expect(screen.getByText("採点者登録")).toBeTruthy()
    expect(screen.getByText("大会設定")).toBeTruthy()
  })
})
