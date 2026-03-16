import { cn } from "@/lib/utils";

type Priority = "critical" | "high" | "normal" | "fyi";

const config: Record<Priority, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  normal: "bg-muted/10 text-muted-foreground border-border",
  fyi: "bg-muted/5 text-muted-foreground/60 border-border/50 text-[10px]",
};

const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize", config[priority])}>
    {priority}
  </span>
);

export default PriorityBadge;
