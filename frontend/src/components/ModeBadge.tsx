import { cn } from "@/lib/utils";

type Mode = "morning" | "evening" | "alert" | "weekly";

const config: Record<Mode, string> = {
  morning: "bg-primary/10 text-primary border-primary/20",
  evening: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  alert: "bg-red-500/10 text-red-400 border-red-500/20",
  weekly: "bg-green-500/10 text-green-400 border-green-500/20",
};

const ModeBadge = ({ mode }: { mode: Mode }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize", config[mode])}>
    {mode}
  </span>
);

export default ModeBadge;
