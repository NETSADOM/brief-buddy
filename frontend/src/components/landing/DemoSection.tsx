import { motion } from "framer-motion";
import AudioPlayer from "../AudioPlayer";

const DemoSection = () => (
  <section id="demo" className="py-24 px-6 border-t border-border/50">
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="label-caps text-primary mb-4 block">Live demo</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
          Hear what your morning sounds like
        </h2>
        <p className="text-muted-foreground mb-10">
          A sample briefing generated entirely by AI from real data inputs.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <AudioPlayer duration="1:32" />
        <p className="text-xs text-muted-foreground/50 mt-4">
          This was generated entirely by AI from real data inputs.
        </p>
      </motion.div>
    </div>
  </section>
);

export default DemoSection;
