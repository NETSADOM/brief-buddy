import { motion } from "framer-motion";
import { Link2, Brain, Mic, Phone } from "lucide-react";

const steps = [
  { icon: Link2, num: "01", title: "Connect your tools", desc: "Gmail, Calendar, Slack, CRM in one click." },
  { icon: Brain, num: "02", title: "AI compiles your day", desc: "Emails, meetings, deals, news — prioritized by urgency." },
  { icon: Mic, num: "03", title: "ElevenLabs crafts your call", desc: "Natural voice, personalized script, 90 seconds." },
  { icon: Phone, num: "04", title: "Your phone rings", desc: "Pick up and start your day fully informed." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 px-6 border-t border-border/50">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="label-caps text-primary mb-4 block">How it works</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Four steps to a smarter morning</h2>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-border" />

        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-center"
          >
            <div className="w-20 h-20 rounded-2xl card-surface mx-auto mb-6 flex items-center justify-center relative z-10">
              <s.icon className="w-8 h-8 text-primary" />
            </div>
            <span className="label-caps text-primary/60 mb-2 block">{s.num}</span>
            <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
