import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ECG path: flat → spike → flat → QRS complex → flat
// Drawn as an SVG polyline that gets progressively revealed via stroke-dashoffset animation
const ECG_PATH = "M0,50 L60,50 L70,50 L75,20 L80,80 L85,10 L90,70 L95,50 L110,50 L120,50 L125,30 L128,60 L131,50 L160,50 L220,50";

const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('drawing'); // 'drawing' | 'pulse' | 'fading'

    useEffect(() => {
        // After ECG draws (1.8s), hold briefly then fade
        const pulseTimer = setTimeout(() => setPhase('pulse'), 1900);
        const fadeTimer = setTimeout(() => setPhase('fading'), 2600);
        const doneTimer = setTimeout(() => onComplete(), 3400);
        return () => {
            clearTimeout(pulseTimer);
            clearTimeout(fadeTimer);
            clearTimeout(doneTimer);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase === 'fading' ? 0 : 1 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: '#070b14',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2rem',
                    }}
                >
                    {/* ECG Line SVG */}
                    <div style={{ position: 'relative', width: '340px', height: '100px' }}>
                        {/* Glow layer */}
                        <svg
                            viewBox="0 0 220 100"
                            width="340"
                            height="100"
                            style={{ position: 'absolute', top: 0, left: 0, filter: 'blur(8px)', opacity: 0.5 }}
                        >
                            <motion.polyline
                                points={ECG_PATH.replace('M', '').replace(/L/g, ' ')}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.8, ease: 'easeInOut' }}
                            />
                        </svg>

                        {/* Main ECG line */}
                        <svg viewBox="0 0 220 100" width="340" height="100">
                            {/* Grid lines */}
                            {[20, 40, 60, 80].map(y => (
                                <line key={y} x1="0" y1={y} x2="220" y2={y}
                                    stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
                            ))}
                            {[40, 80, 120, 160, 200].map(x => (
                                <line key={x} x1={x} y1="0" x2={x} y2="100"
                                    stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
                            ))}

                            {/* ECG path */}
                            <motion.polyline
                                points="0,50 60,50 70,50 75,20 80,80 85,10 90,70 95,50 110,50 120,50 125,30 128,60 131,50 160,50 220,50"
                                fill="none"
                                stroke="url(#ecgGradient)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.8, ease: 'easeInOut' }}
                            />

                            {/* Traveling dot at the tip */}
                            <motion.circle
                                r="4"
                                fill="#a855f7"
                                filter="url(#dotGlow)"
                                initial={{ offsetDistance: '0%', opacity: 0 }}
                                animate={{ opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 1.8, ease: 'easeInOut', times: [0, 0.05, 0.95, 1] }}
                                style={{
                                    offsetPath: `path("M0,50 L60,50 L70,50 L75,20 L80,80 L85,10 L90,70 L95,50 L110,50 L120,50 L125,30 L128,60 L131,50 L160,50 L220,50")`,
                                    offsetDistance: '0%',
                                }}
                            />

                            <defs>
                                <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                                <filter id="dotGlow">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                        </svg>

                        {/* Pulse ring when ECG completes */}
                        {phase === 'pulse' && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0.8 }}
                                animate={{ scale: 3, opacity: 0 }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    right: '-8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'rgba(168,85,247,0.6)',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                    </div>

                    {/* Brand name fades in after ECG draws */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6, duration: 0.6 }}
                        style={{ textAlign: 'center' }}
                    >
                        <h1 style={{
                            fontSize: '2.8rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #fff 0%, #6366f1 50%, #a855f7 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-1px',
                            margin: 0,
                        }}>
                            QuickCure
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.0, duration: 0.4 }}
                            style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem', marginTop: '6px', letterSpacing: '2px', textTransform: 'uppercase' }}
                        >
                            Healthcare at your fingertips
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
