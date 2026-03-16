import { motion } from "framer-motion";
import { Sun, AlertTriangle, Moon, BarChart3, CheckSquare, Mic } from "lucide-react";

const features = [
  { icon: Sun, title: "Morning briefing", desc: "Daily 7am call with your full day summary, priorities, and critical updates.", color: "text-yellow-400" },
  { icon: AlertTriangle, title: "Urgent alerts", desc: "Instant call when something critical needs your immediate attention.", color: "text-red-400" },
  { icon: Moon, title: "Evening wrap-up", desc: "End-of-day recap with accomplishments and tomorrow's preparation.", color: "text-blue-400" },
  { icon: BarChart3, title: "Weekly recap", desc: "Friday KPI summary, wins, and strategic outlook for next week.", color: "text-green-400" },
  { icon: CheckSquare, title: "Task intelligence", desc: "Auto-extracts action items from emails, Slack, and CRM conversations.", color: "text-primary" },
  { icon: Mic, title: "Your voice", desc: "Powered by ElevenLabs for a natural, human-sounding experience.", color: "text-accent" },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="label-caps text-primary mb-4 block">Features</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Everything you need to start informed</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="card-surface-hover p-6 group"
          >
            <f.icon className={`w-6 h-6 ${f.color} mb-4`} />
            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
