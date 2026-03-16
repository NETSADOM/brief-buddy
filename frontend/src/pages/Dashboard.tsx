import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, TrendingUp, Play, Loader2 } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import PriorityBadge from "@/components/PriorityBadge";
import {
  getSettings,
  getTasks,
  getBriefingsHistory,
  getIntegrations,
  triggerBriefing,
  updateTask,
  type TaskRow,
  type BriefingRow,
} from "@/lib/api";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const } } };

function formatNextBriefing(morningTime: string): string {
  const [h, m] = morningTime.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(h, m ?? 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["briefings"],
    queryFn: getBriefingsHistory,
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: getIntegrations,
  });

  const triggerMutation = useMutation({
    mutationFn: () => triggerBriefing("morning"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefings"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const openTasks = tasks.filter((t) => t.status === "open");
  const criticalHigh = openTasks.filter(
    (t) => t.priority === "CRITICAL" || t.priority === "HIGH"
  ).length;
  const lastBriefing = history[0] as BriefingRow | undefined;
  const nextBriefingLabel = settings ? formatNextBriefing(settings.morningTime) : "—";
  const integrationNames: Record<string, string> = {
    google: "Gmail & Calendar",
    slack: "Slack",
    crm: "HubSpot",
  };

  const stats = [
    {
      label: "Next Briefing",
      value: settingsLoading ? "…" : nextBriefingLabel,
      sub: "System Ready",
      subColor: "text-green-500",
      dot: "bg-green-500",
      icon: Clock,
    },
    {
      label: "Last Briefing",
      value: historyLoading ? "…" : lastBriefing ? new Date(lastBriefing.createdAt).toLocaleDateString() : "—",
      sub: lastBriefing?.deliveryStatus === "delivered" ? "Delivered ✓" : "—",
      subColor: "text-green-500/80",
      dot: "bg-green-500",
      icon: CheckCircle,
    },
    {
      label: "Open Tasks",
      value: tasksLoading ? "…" : `${openTasks.length} tasks`,
      sub: criticalHigh ? `${criticalHigh} critical/high` : "—",
      subColor: "text-orange-400",
      dot: "bg-orange-400",
      icon: AlertTriangle,
    },
    {
      label: "CRM Alerts",
      value: "—",
      sub: "Connect CRM in Settings",
      subColor: "text-accent",
      dot: "bg-accent",
      icon: TrendingUp,
    },
  ];

  const briefingPreview = lastBriefing?.script?.slice(0, 200) ?? "No briefing yet. Trigger one to hear your summary.";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {lastBriefing
          ? `${new Date(lastBriefing.createdAt).toLocaleString()} — ${lastBriefing.deliveryStatus}`
          : "Trigger a briefing to get started."}
      </p>

      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="card-surface p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="label-caps">{s.label}</span>
              <s.icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-medium text-foreground">{s.value}</h3>
            <div className="mt-3 flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse`} />
              <span className={`text-xs font-medium ${s.subColor}`}>{s.sub}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-surface p-6"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Today&apos;s Briefing Preview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
            {briefingPreview}
            {lastBriefing?.script && lastBriefing.script.length > 200 ? "…" : ""}
          </p>
          {lastBriefing?.audioUrl && (
            <AudioPlayer compact duration="1:32" className="mb-4" src={lastBriefing.audioUrl} />
          )}
          <button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
            className="w-full py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {triggerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Triggering…
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Trigger now
              </>
            )}
          </button>
          {triggerMutation.isError && (
            <p className="text-xs text-destructive mt-2">{String(triggerMutation.error)}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-surface p-6"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Today&apos;s Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Connect Google Calendar in Settings to see your schedule here.
          </p>
        </motion.div>
      </div>

      {/* Task inbox */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-surface p-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">Task Inbox</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left label-caps pb-3 font-bold">Task</th>
                <th className="text-left label-caps pb-3 font-bold hidden sm:table-cell">Source</th>
                <th className="text-left label-caps pb-3 font-bold">Priority</th>
                <th className="text-left label-caps pb-3 font-bold hidden md:table-cell">Due</th>
                <th className="text-right label-caps pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasksLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Loading tasks…
                  </td>
                </tr>
              ) : (
                openTasks.map((t: TaskRow, i: number) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="py-3 text-foreground">{t.text}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell capitalize">{t.source}</td>
                    <td className="py-3">
                      <PriorityBadge priority={t.priority.toLowerCase()} />
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={() => updateTaskMutation.mutate({ id: t.id, status: "done" })}
                          disabled={updateTaskMutation.isPending}
                        >
                          Done
                        </button>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => updateTaskMutation.mutate({ id: t.id, status: "snoozed" })}
                          disabled={updateTaskMutation.isPending}
                        >
                          Snooze
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Integration status */}
      <div className="mt-6 flex items-center gap-4 flex-wrap">
        {integrations.map((i) => (
          <div key={i.provider} className="flex items-center gap-2 text-xs">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                i.connected ? "bg-green-500" : "bg-muted-foreground/30"
              }`}
            />
            <span className="text-muted-foreground">{integrationNames[i.provider] ?? i.provider}</span>
            {!i.connected && (
              <a
                href={`/dashboard/settings`}
                className="text-primary text-[10px] hover:underline"
              >
                Connect
              </a>
            )}
          </div>
        ))}
        {integrationsLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
      </div>
    </div>
  );
};

export default Dashboard;
