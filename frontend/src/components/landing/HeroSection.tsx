import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import Waveform from "../Waveform";

const floatingCards = [
  { text: "3 urgent emails", x: -180, y: -40, delay: 0.8 },
  { text: "Meeting in 45 min", x: 160, y: -60, delay: 1.0 },
  { text: "Deal needs follow-up", x: -140, y: 80, delay: 1.2 },
];

const HeroSection = () => (
  <section className="pt-[18vh] pb-[10vh] px-6 flex flex-col items-center text-center relative overflow-hidden">
    {/* Subtle gradient orb */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="label-caps text-primary mb-6"
    >
      Now integrated with ElevenLabs
    </motion.span>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-balance mb-6 max-w-4xl"
    >
      Your morning briefing.
      <br />
      <span className="text-foreground/40">In your voice.</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
    >
      Brief Buddy calls you every morning with a personalized AI briefing — your emails, calendar, deals, and news. Hands-free. 90 seconds. Done.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex flex-col sm:flex-row gap-4"
    >
      <a href="#pricing" className="bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold hover:brightness-110 transition-all">
        Start free trial
      </a>
      <a href="#demo" className="bg-foreground/5 border border-foreground/10 backdrop-blur-md px-8 py-4 rounded-full font-semibold hover:bg-foreground/10 transition-all text-foreground">
        Hear a sample call
      </a>
    </motion.div>

    {/* Phone mockup */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 relative"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="card-surface p-6 rounded-3xl w-[280px] mx-auto relative"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Brief Buddy Assistant</p>
            <p className="text-xs text-green-500">Incoming call...</p>
          </div>
        </div>
        <Waveform bars={30} height={36} />
        <div className="mt-4 flex gap-2">
          <button className="flex-1 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
            Accept
          </button>
          <button className="flex-1 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
            Decline
          </button>
        </div>
      </motion.div>

      {/* Floating cards */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: card.delay, duration: 0.5 }}
          className="hidden md:block absolute card-surface px-3 py-2 rounded-lg text-xs text-muted-foreground whitespace-nowrap"
          style={{ left: `calc(50% + ${card.x}px)`, top: `calc(50% + ${card.y}px)` }}
        >
          {card.text}
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default HeroSection;
