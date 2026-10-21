import { stageLabel } from "@/lib/gigflow";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  saved: "bg-muted text-muted-foreground",
  ready_to_pitch: "bg-accent text-accent-foreground",
  pitched: "bg-secondary/15 text-secondary",
  follow_up_due: "bg-primary/15 text-primary",
  in_conversation: "bg-chart-4/15 text-foreground",
  booked: "bg-secondary text-secondary-foreground",
  closed: "bg-foreground/10 text-muted-foreground",
};

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[stage] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {stageLabel(stage)}
    </span>
  );
}
