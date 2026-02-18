import React, { memo } from 'react';
import { motion } from 'framer-motion';

// Reduced to 8 icons (from 15) — fewer DOM nodes, less GPU work
const floatingItems = [
    { x: '5%', y: '10%', size: 26, duration: 16, delay: 0, symbol: '✚', isPlus: true },
    { x: '20%', y: '70%', size: 22, duration: 20, delay: 2, symbol: '🩺', isPlus: false },
    { x: '40%', y: '20%', size: 20, duration: 14, delay: 1, symbol: '💊', isPlus: false },
    { x: '60%', y: '75%', size: 28, duration: 18, delay: 3, symbol: '🫀', isPlus: false },
    { x: '75%', y: '15%', size: 20, duration: 22, delay: 0.5, symbol: '🧬', isPlus: false },
    { x: '88%', y: '50%', size: 24, duration: 15, delay: 4, symbol: '💉', isPlus: false },
    { x: '50%', y: '88%', size: 18, duration: 17, delay: 1.5, symbol: '☤', isPlus: true },
    { x: '30%', y: '45%', size: 16, duration: 19, delay: 2.5, symbol: '🏥', isPlus: false },
];

// Simplified 3-keyframe animation (was 5) — much lighter on GPU
const makeAnimate = () => ({
    y: [0, -22, 0],
    opacity: [0, 0.4, 0],
    scale: [0.95, 1.08, 0.95],
});

const blobStyle1 = {
    position: 'absolute',
    top: '-15%', right: '-10%',
    width: '55vw', height: '55vw',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    willChange: 'transform',
};

const blobStyle2 = {
    position: 'absolute',
    bottom: '-10%', left: '-10%',
    width: '45vw', height: '45vw',
    background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    willChange: 'transform',
};

const containerStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
};

// memo prevents re-render when parent re-renders
const HospitalBackground = memo(() => {
    return (
        <div style={containerStyle}>
            <div style={blobStyle1} />
            <div style={blobStyle2} />

            {floatingItems.map((item, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: item.x,
                        top: item.y,
                        fontSize: `${item.size}px`,
                        opacity: 0,
                        userSelect: 'none',
                        willChange: 'transform, opacity',
                        color: item.isPlus ? 'rgba(99,102,241,0.5)' : undefined,
                        filter: item.isPlus
                            ? 'drop-shadow(0 0 6px rgba(99,102,241,0.5))'
                            : 'drop-shadow(0 0 3px rgba(168,85,247,0.25))',
                    }}
                    animate={makeAnimate()}
                    transition={{
                        duration: item.duration,
                        delay: item.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    {item.symbol}
                </motion.div>
            ))}
        </div>
    );
});

HospitalBackground.displayName = 'HospitalBackground';
export default HospitalBackground;
