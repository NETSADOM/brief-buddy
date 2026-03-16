import { motion } from "framer-motion";

const integrations = [
  { name: "Gmail", icon: "📧" },
  { name: "Google Calendar", icon: "📅" },
  { name: "Slack", icon: "💬" },
  { name: "HubSpot", icon: "🟠" },
  { name: "Salesforce", icon: "☁️" },
  { name: "Notion", icon: "📝", comingSoon: true },
];

const IntegrationsSection = () => (
  <section className="py-24 px-6 border-t border-border/50">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="label-caps text-primary mb-4 block">Integrations</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-12">
          Works with the tools you already use
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {integrations.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="card-surface-hover p-6 flex flex-col items-center gap-3"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm font-medium text-foreground">{item.name}</span>
            {item.comingSoon && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-muted/10 text-muted-foreground border border-border">
                Coming Soon
              </span>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 mt-6">More integrations coming soon</p>
    </div>
  </section>
);

export default IntegrationsSection;
