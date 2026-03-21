import { motion } from "framer-motion";

const FinalCTA = () => (
  <section className="py-24 px-6 border-t border-border/50">
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
          Stop starting your day in your inbox.
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          Let Brief Buddy brief you instead.
        </p>
        <a href="#pricing" className="inline-block bg-accent text-accent-foreground px-10 py-4 rounded-full font-semibold text-lg hover:brightness-110 transition-all glow-accent">
          Start your free 14-day trial
        </a>
        <p className="text-xs text-muted-foreground/50 mt-4">No credit card required. Cancel anytime.</p>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
