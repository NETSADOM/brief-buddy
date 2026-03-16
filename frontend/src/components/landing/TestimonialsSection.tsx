import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I used to spend 30 minutes every morning triaging emails. Now I just pick up the phone.",
    name: "Sarah K.",
    role: "Founder @ MarketMint",
  },
  {
    quote: "The urgent alert feature saved a client relationship. Got a call the moment they emailed 'we need to talk'.",
    name: "James R.",
    role: "Agency Owner",
  },
  {
    quote: "It feels like having a real EA. The voice is so natural I forget it's AI.",
    name: "Priya D.",
    role: "Consultant",
  },
];

const TestimonialsSection = () => (
  <section className="py-24 px-6 border-t border-border/50">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="label-caps text-primary mb-4 block">Testimonials</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Loved by busy founders</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-surface p-6"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-foreground text-sm leading-relaxed mb-6">"{t.quote}"</p>
            <div>
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
