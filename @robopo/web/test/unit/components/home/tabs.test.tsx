import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, screen } from "@testing-library/react"
import { ChallengeTab, ManageTab } from "@/app/components/home/tabs"
import { renderWithRouter } from "../../../utils/router"

afterEach(cleanup)

const competitionList = {
  competitions: [
    {
      id: 1,
      name: "Active Comp",

      description: null,
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2027-12-31T00:00:00.000Z"),
      createdAt: null,
    },
    {
      id: 2,
      name: "Closed Comp",

      description: null,
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: new Date("2024-12-31T00:00:00.000Z"),
      createdAt: null,
    },
    {
      id: 3,
      name: "Prep Comp",

      description: null,
      startDate: new Date("2027-06-01T00:00:00.000Z"),
      endDate: new Date("2027-12-31T00:00:00.000Z"),
      createdAt: null,
    },
  ],
}

const courseList = {
  courses: [
    {
      id: 1,
      name: "Course A",
      description: null,
      field: null,
      fieldValid: false,
      mission: null,
      missionValid: false,
      point: null,
      courseOutRule: "keep",
      isConfigured: true,
      createdAt: null,
    },
    {
      id: 2,
      name: "Course B",
      description: null,
      field: null,
      fieldValid: false,
      mission: null,
      missionValid: false,
      point: null,
      courseOutRule: "keep",
      isConfigured: true,
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

const judgeList = [
  { id: 1, username: "judgea", note: null, userId: "u1", createdAt: null },
  { id: 2, username: "judgeb", note: null, userId: "u2", createdAt: null },
]

const competitionJudgeList = {
  competitionJudgeList: [
    { id: 1, competitionId: 1, judgeId: 1, createdAt: null },
    { id: 2, competitionId: 1, judgeId: 2, createdAt: null },
  ],
}

describe("ChallengeTab", () => {
  test("shows competition name when single active competition", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Only Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("Only Comp")).toBeTruthy()
  })

  test("renders judge selection dropdown", () => {
    renderWithRouter(
      <ChallengeTab
        competitionList={competitionList}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("judgea")).toBeTruthy()
    expect(screen.getByText("judgeb")).toBeTruthy()
  })

  test("shows course cards when single competition is active", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    const courseButton = screen.getByText("Course A").closest("button")
    expect(courseButton).toBeTruthy()
  })

  test("renders course cards when competition is selected", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("Course A")).toBeTruthy()
    expect(screen.getByText("Course B")).toBeTruthy()
  })

  test("shows placeholder when no competition selected", () => {
    const multiActive = {
      competitions: [
        {
          id: 1,
          name: "Comp A",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
        {
          id: 2,
          name: "Comp B",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={multiActive}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    const placeholders = screen.getAllByText("大会を選択してください")
    expect(placeholders.length).toBeGreaterThan(0)
  })

  test("renders judge cards as buttons for selection", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )

    // Judge cards should render as buttons
    const judgeButton = screen.getByText("judgea").closest("button")
    expect(judgeButton).toBeTruthy()

    // Course cards should also be buttons
    const courseButton = screen.getByText("Course A").closest("button")
    expect(courseButton).toBeTruthy()
  })
})

describe("ManageTab", () => {
  test("renders all management links", () => {
    renderWithRouter(<ManageTab />)
    expect(screen.getByText("大会一覧")).toBeTruthy()
    expect(screen.getByText("コース一覧")).toBeTruthy()
    expect(screen.getByText("選手一覧")).toBeTruthy()
    expect(screen.getByText("採点者一覧")).toBeTruthy()
    expect(screen.getByText("集計結果")).toBeTruthy()
  })
})
