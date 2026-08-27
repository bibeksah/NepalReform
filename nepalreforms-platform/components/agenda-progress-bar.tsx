import { cn } from "@/lib/utils"

interface AgendaProgressBarProps {
  value: number | null
  label?: string
  className?: string
}

export function AgendaProgressBar({ value, label, className }: AgendaProgressBarProps) {
  const safeValue = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label ?? "Public progress signal"}</span>
        <span>{safeValue == null ? "Limited" : `${safeValue}%`}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 transition-all",
            safeValue == null && "w-[18%] opacity-50"
          )}
          style={safeValue == null ? undefined : { width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}
