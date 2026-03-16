import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "€29",
    desc: "Perfect for getting started",
    features: ["1 user", "Morning briefing only", "Gmail + Calendar", "Standard voice"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€79",
    desc: "For power users who want it all",
    features: ["1 user", "All 4 briefing modes", "All integrations", "Task intelligence", "ElevenLabs voice cloning", "Priority support"],
    highlighted: true,
  },
  {
    name: "Team",
    price: "€199",
    desc: "For growing teams",
    features: ["Up to 5 users", "All Pro features", "Shared CRM alerts", "Team task view", "Priority support", "Custom onboarding"],
    highlighted: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24 px-6 border-t border-border/50">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="label-caps text-primary mb-4 block">Pricing</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Simple, transparent pricing</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "card-surface p-6 flex flex-col relative",
              t.highlighted && "ring-1 ring-primary/30 glow-primary"
            )}
          >
            {t.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{t.desc}</p>
            <div className="mb-6">
              <span className="text-4xl font-semibold text-foreground">{t.price}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <ul className="flex-1 space-y-3 mb-6">
              {t.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={cn(
                "w-full py-3 rounded-full text-sm font-semibold transition-all",
                t.highlighted
                  ? "bg-accent text-accent-foreground hover:brightness-110"
                  : "bg-foreground/5 border border-foreground/10 text-foreground hover:bg-foreground/10"
              )}
            >
              Start free trial
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
