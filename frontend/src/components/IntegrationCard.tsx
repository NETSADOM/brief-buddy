import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  comingSoon?: boolean;
  onToggle?: () => void;
}

const IntegrationCard = ({ name, icon, connected, lastSync, comingSoon, onToggle }: IntegrationCardProps) => (
  <div className="card-surface p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground text-sm">{name}</span>
          {comingSoon && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/10 text-muted-foreground border border-border">
              Coming Soon
            </span>
          )}
        </div>
        {connected && lastSync && (
          <span className="text-xs text-muted-foreground">Synced {lastSync}</span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500" : "bg-muted-foreground/30")} />
      {!comingSoon && (
        <button
          onClick={onToggle}
          className={cn(
            "text-xs font-medium px-3 py-1 rounded-full transition-colors",
            connected
              ? "text-muted-foreground hover:text-foreground"
              : "bg-accent text-accent-foreground hover:brightness-110"
          )}
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      )}
    </div>
  </div>
);

export default IntegrationCard;
