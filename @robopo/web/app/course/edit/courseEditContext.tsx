"use client"

import type React from "react"
import { createContext, useCallback, useContext, useRef, useState } from "react"
import {
  type FieldState,
  initializeField,
  type MissionState,
  type PanelValue,
  type PointState,
} from "@/app/components/course/utils"

export type ToolType = PanelValue | "eraser"

// Form contents
export type CourseEditState = {
  name: string
  description: string
  field: FieldState
  mission: MissionState
  point: PointState
  courseOutRule: string
  selectedTool: ToolType
  setName: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  setField: React.Dispatch<React.SetStateAction<FieldState>>
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
  setCourseOutRule: React.Dispatch<React.SetStateAction<string>>
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolType>>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  pushHistory: () => void
  // Mission undo/redo
  undoMission: () => void
  redoMission: () => void
  canUndoMission: boolean
  canRedoMission: boolean
  pushMissionHistory: () => void
}

// Dummy initial values
const dummy: CourseEditState = {
  name: "",
  description: "",
  field: initializeField(),
  mission: [],
  point: [],
  courseOutRule: "keep",
  selectedTool: "start",
  setName: () => {},
  setDescription: () => {},
  setField: () => {},
  setMission: () => {},
  setPoint: () => {},
  setCourseOutRule: () => {},
  setSelectedTool: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  pushHistory: () => {},
  undoMission: () => {},
  redoMission: () => {},
  canUndoMission: false,
  canRedoMission: false,
  pushMissionHistory: () => {},
}

const CourseEditContext = createContext<CourseEditState>(dummy)

export const useCourseEdit = () => useContext(CourseEditContext)

const MAX_HISTORY = 50

export function CourseEditProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [field, setField] = useState<FieldState>(initializeField())
  // Default: 1 empty mission for the start panel action
  // Format: [startDir, goalDir, mission0, param0]
  const [mission, setMission] = useState<MissionState>([null, null, null, null])
  // Format: [startPoint, goalPoint, mission0Point]
  const [point, setPoint] = useState<PointState>([0, 10, 0])
  const [courseOutRule, setCourseOutRule] = useState<string>("keep")
  const [selectedTool, setSelectedTool] = useState<ToolType>("start")

  // Field Undo/Redo history
  const historyRef = useRef<FieldState[]>([])
  const redoRef = useRef<FieldState[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Mission Undo/Redo history
  type MissionSnapshot = { mission: MissionState; point: PointState }
  const missionHistoryRef = useRef<MissionSnapshot[]>([])
  const missionRedoRef = useRef<MissionSnapshot[]>([])
  const [canUndoMission, setCanUndoMission] = useState(false)
  const [canRedoMission, setCanRedoMission] = useState(false)

  const pushHistory = useCallback(() => {
    historyRef.current = [
      ...historyRef.current.slice(-MAX_HISTORY + 1),
      field.map((row) => [...row]),
    ]
    // New action clears redo stack
    redoRef.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [field])

  const undo = useCallback(() => {
    const history = historyRef.current
    if (history.length > 0) {
      // Save current state to redo stack
      setField((currentField) => {
        redoRef.current = [
          ...redoRef.current,
          currentField.map((row) => [...row]),
        ]
        setCanRedo(true)
        return currentField
      })
      const prev = history[history.length - 1]
      historyRef.current = history.slice(0, -1)
      setCanUndo(historyRef.current.length > 0)
      setField(prev)
    }
  }, [])

  const redo = useCallback(() => {
    const redoStack = redoRef.current
    if (redoStack.length > 0) {
      // Save current state to undo stack
      setField((currentField) => {
        historyRef.current = [
          ...historyRef.current,
          currentField.map((row) => [...row]),
        ]
        setCanUndo(true)
        return currentField
      })
      const next = redoStack[redoStack.length - 1]
      redoRef.current = redoStack.slice(0, -1)
      setCanRedo(redoRef.current.length > 0)
      setField(next)
    }
  }, [])

  const pushMissionHistory = useCallback(() => {
    missionHistoryRef.current = [
      ...missionHistoryRef.current.slice(-MAX_HISTORY + 1),
      { mission: [...mission], point: [...point] },
    ]
    missionRedoRef.current = []
    setCanUndoMission(true)
    setCanRedoMission(false)
  }, [mission, point])

  const undoMission = useCallback(() => {
    const history = missionHistoryRef.current
    if (history.length > 0) {
      // Save current to redo
      setMission((curMission) => {
        setPoint((curPoint) => {
          missionRedoRef.current = [
            ...missionRedoRef.current,
            { mission: [...curMission], point: [...curPoint] },
          ]
          setCanRedoMission(true)
          return curPoint
        })
        return curMission
      })
      const prev = history[history.length - 1]
      missionHistoryRef.current = history.slice(0, -1)
      setCanUndoMission(missionHistoryRef.current.length > 0)
      setMission(prev.mission)
      setPoint(prev.point)
    }
  }, [])

  const redoMission = useCallback(() => {
    const redoStack = missionRedoRef.current
    if (redoStack.length > 0) {
      setMission((curMission) => {
        setPoint((curPoint) => {
          missionHistoryRef.current = [
            ...missionHistoryRef.current,
            { mission: [...curMission], point: [...curPoint] },
          ]
          setCanUndoMission(true)
          return curPoint
        })
        return curMission
      })
      const next = redoStack[redoStack.length - 1]
      missionRedoRef.current = redoStack.slice(0, -1)
      setCanRedoMission(missionRedoRef.current.length > 0)
      setMission(next.mission)
      setPoint(next.point)
    }
  }, [])

  return (
    <CourseEditContext.Provider
      value={{
        name,
        description,
        field,
        mission,
        point,
        courseOutRule,
        selectedTool,
        setName,
        setDescription,
        setField,
        setMission,
        setPoint,
        setCourseOutRule,
        setSelectedTool,
        undo,
        redo,
        canUndo,
        canRedo,
        pushHistory,
        undoMission,
        redoMission,
        canUndoMission,
        canRedoMission,
        pushMissionHistory,
      }}
    >
      {children}
    </CourseEditContext.Provider>
  )
}
