import { motion } from "framer-motion";

interface WaveformProps {
  bars?: number;
  playing?: boolean;
  className?: string;
  height?: number;
}

const Waveform = ({ bars = 40, playing = true, className = "", height = 48 }: WaveformProps) => {
  return (
    <div className={`flex items-end gap-[2px] ${className}`} style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = (i / bars) * Math.PI * 2;
        const baseHeight = 0.3 + 0.7 * Math.abs(Math.sin(phase * 1.5));
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            animate={playing ? {
              scaleY: [baseHeight * 0.4, baseHeight, baseHeight * 0.6, baseHeight * 0.9, baseHeight * 0.3],
            } : { scaleY: baseHeight * 0.3 }}
            transition={playing ? {
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.02,
            } : { duration: 0.3 }}
            style={{
              background: `linear-gradient(to top, hsl(246 89% 70%), hsl(12 85% 63%))`,
              height: "100%",
              transformOrigin: "bottom",
            }}
          />
        );
      })}
    </div>
  );
};

export default Waveform;
