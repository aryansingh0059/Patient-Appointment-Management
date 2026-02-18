import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown } from 'lucide-react';

const TIME_SLOTS = {
    '🌅 Morning': ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    '☀️ Afternoon': ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
    '🌆 Evening': ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'],
};

const formatDisplay = (time) => {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const TimeSlotPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (slot) => {
        onChange(slot);
        setOpen(false);
    };

    return (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
            {/* Trigger button */}
            <motion.button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                whileHover={{ borderColor: 'var(--primary)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${open ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    color: value ? 'white' : 'rgba(148,163,184,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s',
                    boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} color={value ? 'var(--primary)' : 'rgba(148,163,184,0.5)'} />
                    {value ? formatDisplay(value) : 'Select a time slot'}
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} color="rgba(148,163,184,0.5)" />
                </motion.span>
            </motion.button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            background: 'rgba(10, 14, 26, 0.92)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            borderRadius: '18px',
                            padding: '1.2rem',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
                        }}
                    >
                        {Object.entries(TIME_SLOTS).map(([period, slots], pi) => (
                            <div key={period} style={{ marginBottom: pi < 2 ? '1rem' : 0 }}>
                                {/* Period header */}
                                <p style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    letterSpacing: '1px',
                                    color: 'rgba(148,163,184,0.5)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.6rem',
                                    paddingLeft: '2px',
                                }}>
                                    {period}
                                </p>

                                {/* Slot chips */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '8px',
                                }}>
                                    {slots.map((slot, i) => {
                                        const selected = value === slot;
                                        return (
                                            <motion.button
                                                key={slot}
                                                type="button"
                                                onClick={() => handleSelect(slot)}
                                                initial={{ opacity: 0, scale: 0.85 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: pi * 0.05 + i * 0.02 }}
                                                whileHover={{ scale: 1.06, y: -1 }}
                                                whileTap={{ scale: 0.95 }}
                                                style={{
                                                    padding: '8px 4px',
                                                    borderRadius: '10px',
                                                    border: selected
                                                        ? '1px solid rgba(99,102,241,0.6)'
                                                        : '1px solid rgba(255,255,255,0.07)',
                                                    background: selected
                                                        ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))'
                                                        : 'rgba(255,255,255,0.04)',
                                                    color: selected ? 'white' : 'rgba(148,163,184,0.8)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: selected ? '700' : '500',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    boxShadow: selected ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                                                    transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                                                }}
                                            >
                                                {formatDisplay(slot)}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Clear button */}
                        {value && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => { onChange(''); setOpen(false); }}
                                style={{
                                    marginTop: '1rem',
                                    width: '100%',
                                    padding: '8px',
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    borderRadius: '10px',
                                    color: '#ef4444',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Clear Selection
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimeSlotPicker;
