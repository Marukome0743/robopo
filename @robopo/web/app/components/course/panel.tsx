import {
  PANEL_SIZE,
  PanelString,
  type PanelValue,
} from "@/app/components/course/utils"

// Panel component
export function Panel({
  value,
  type,
  onClick,
}: {
  value: PanelValue
  type?: string
  onClick: () => void
}) {
  const routeStyle =
    value === "start"
      ? "bg-pink-300"
      : value === "goal"
        ? "bg-green-300"
        : "bg-blue-300"
  const textStyle = type === "ipponBashi" ? "text-[10px]" : "text-lg"
  const hasRole =
    value === "start" ||
    value === "goal" ||
    value === "route" ||
    value === "startGoal"

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 flex-col items-center justify-center border border-gray-800 bg-white"
      style={{ width: `${PANEL_SIZE}px`, height: `${PANEL_SIZE}px` }}
    >
      {hasRole &&
        (value === "startGoal" ? (
          // When Start and Goal overlap
          <>
            <div
              className={`${textStyle} flex items-center justify-center rounded-t-sm bg-pink-300 font-bold`}
              style={{
                width: `${PANEL_SIZE - 10}px`,
                height: `${PANEL_SIZE / 2 - 5}px`,
              }}
            >
              {PanelString.start}
            </div>
            <div
              className={`${textStyle} flex items-center justify-center rounded-b-sm bg-green-300 font-bold`}
              style={{
                width: `${PANEL_SIZE - 10}px`,
                height: `${PANEL_SIZE / 2 - 5}px`,
              }}
            >
              {PanelString.goal}
            </div>
          </>
        ) : (
          <div
            className={`${routeStyle} ${textStyle} flex items-center justify-center rounded-sm font-bold`}
            style={{
              width: `${PANEL_SIZE - 10}px`,
              height: `${PANEL_SIZE - 10}px`,
            }}
          >
            {PanelString[value]}
          </div>
        ))}
    </button>
  )
}
