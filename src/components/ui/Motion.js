'use client';

import { motion } from 'framer-motion';

export const MotionFadeIn = ({ delay = 0, y = 8, children, ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.35,
      ease: [0.21, 0.6, 0.35, 1],
      delay,
    }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const MotionScaleCard = ({ delay = 0, children, ...rest }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      duration: 0.4,
      ease: [0.22, 1.25, 0.36, 1],
      delay,
    }}
    whileHover={{ y: -4, scale: 1.01 }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const MotionListStagger = ({ items, renderItem, baseDelay = 0.04 }) => (
  <>
    {items.map((item, index) => (
      <MotionFadeIn key={item._id || index} delay={baseDelay * index}>
        {renderItem(item, index)}
      </MotionFadeIn>
    ))}
  </>
);

export const MotionRevealSection = ({
  children,
  delay = 0,
  y = 24,
  ...rest
}) => (
  <motion.section
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      duration: 0.55,
      ease: [0.21, 0.8, 0.3, 1],
      delay,
    }}
    {...rest}
  >
    {children}
  </motion.section>
);


