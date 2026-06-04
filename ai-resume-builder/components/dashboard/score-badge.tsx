import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { scoreLabel, scoreVariant } from "@/lib/utils/score"
import { cn } from "@/lib/utils"

export function ScoreBadge({ score, showBar = false }: { score: number; showBar?: boolean }) {
  const variant = scoreVariant(score)

  return (
    <div className={cn("space-y-2", showBar && "w-full min-w-[120px]")}>
      <div className="flex items-center justify-between gap-2">
        <Badge variant={variant}>ATS {score}%</Badge>
        <span className="text-xs text-muted-foreground">{scoreLabel(score)}</span>
      </div>
      {showBar ? <Progress value={score} className="h-1.5" /> : null}
    </div>
  )
}
