import { useMemo } from "react"
import {
  type FieldState,
  findIsolatedPanels,
  isGoal,
  isStart,
  type MissionErrorReason,
  type MissionState,
  missionStatePair,
  validateMissions,
} from "@/app/components/course/utils"

type ValidationResult = {
  hasStart: boolean
  hasGoal: boolean
  isolatedPanels: Set<string>
  invalidMissionMap: Map<number, MissionErrorReason>
  canSave: boolean
  getSaveBlockMessage: () => string | null
}

export function useCourseValidation({
  field,
  mission,
  name,
  nameError,
}: {
  field: FieldState
  mission: MissionState
  name: string
  nameError: string
}): ValidationResult {
  return useMemo(() => {
    const hasStartPanel = isStart(field)
    const hasGoalPanel = isGoal(field)

    // Isolated panels check
    const isolated = findIsolatedPanels(field)

    // Mission validation
    const invalidMissions =
      hasStartPanel && hasGoalPanel
        ? validateMissions(field, mission)
        : new Map<number, MissionErrorReason>()

    // Check mission configuration
    const pairs = missionStatePair(mission)
    const hasMissions = pairs.length > 0
    const allMissionsConfigured =
      hasMissions && pairs.every(([mType]) => mType !== null)

    // Mission direction set
    const hasStartDirection = mission[0] !== null

    // All conditions for save
    const nameValid = name.trim() !== "" && nameError === ""
    const fieldValid = hasStartPanel && hasGoalPanel && isolated.size === 0
    const missionValid =
      hasStartDirection && allMissionsConfigured && invalidMissions.size === 0

    const canSave = nameValid && fieldValid && missionValid

    function getSaveBlockMessage(): string | null {
      if (!hasStartPanel && !hasGoalPanel) {
        return "スタートとゴールパネルを配置してください"
      }
      if (!hasStartPanel) {
        return "スタートパネルを配置してください"
      }
      if (!hasGoalPanel) {
        return "ゴールパネルを配置してください"
      }
      if (name.trim() === "") {
        return "コース名を入力してください"
      }
      if (nameError) {
        return nameError
      }
      if (isolated.size > 0) {
        return "接続されていないパネルがあります"
      }
      if (!hasStartDirection) {
        return "スタートの向きを選択してください"
      }
      if (!hasMissions) {
        return "ミッションを追加してください"
      }
      if (!allMissionsConfigured) {
        return "未設定のミッションがあります"
      }
      if (invalidMissions.size > 0) {
        return "無効なミッションがあります"
      }
      return null
    }

    return {
      hasStart: hasStartPanel,
      hasGoal: hasGoalPanel,
      isolatedPanels: isolated,
      invalidMissionMap: invalidMissions,
      canSave,
      getSaveBlockMessage,
    }
  }, [field, mission, name, nameError])
}
