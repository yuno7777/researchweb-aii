
'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const dotVariants = {
  initial: {
    y: '0%',
  },
  animate: {
    y: '100%',
  },
};

const dotTransition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut',
};


export function Thinking() {
  return (
    <div className="p-8 border rounded-lg bg-card shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <span>Thinking</span>
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="flex gap-1"
            >
                <motion.span variants={dotVariants} transition={dotTransition} className="h-2 w-2 bg-primary rounded-full" />
                <motion.span variants={dotVariants} transition={{ ...dotTransition, delay: 0.2 }} className="h-2 w-2 bg-primary rounded-full" />
                <motion.span variants={dotVariants} transition={{ ...dotTransition, delay: 0.4 }} className="h-2 w-2 bg-primary rounded-full" />
            </motion.div>
        </div>
        <p className="mt-2 text-muted-foreground">The AI is generating your report...</p>
    </div>
  );
}
