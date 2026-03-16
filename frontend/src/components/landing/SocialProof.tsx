import { motion } from "framer-motion";
import { Star } from "lucide-react";

const logos = ["Gmail", "Slack", "HubSpot", "Google Calendar", "ElevenLabs"];

const SocialProof = () => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="py-12 px-6 border-y border-border/50"
  >
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">Trusted by 500+ small business owners</span>
      </div>
      <div className="flex items-center gap-6 flex-wrap justify-center">
        {logos.map(l => (
          <span key={l} className="text-xs text-muted-foreground/50 font-medium uppercase tracking-wider">{l}</span>
        ))}
      </div>
    </div>
  </motion.section>
);

export default SocialProof;
