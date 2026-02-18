import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, Check } from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 to 19
const MINUTES = ['00', '15', '30', '45'];

const formatDisplay = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
};

const ITEM_H = 38; // compact item height

const Drum = ({ items, selectedIndex, onSelect, formatItem }) => {
    const listRef = useRef(null);

    // Scroll to selected on mount / change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = selectedIndex * ITEM_H;
        }
    }, [selectedIndex]);

    const handleScroll = useCallback(() => {
        if (!listRef.current) return;
        const idx = Math.round(listRef.current.scrollTop / ITEM_H);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        onSelect(clamped);
    }, [items.length, onSelect]);

    return (
        <div style={{ position: 'relative', width: '80px', height: `${ITEM_H * 3}px`, overflow: 'hidden' }}>
            {/* Top fade */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H,
                background: 'linear-gradient(to bottom, rgba(10,14,26,0.95), transparent)',
                zIndex: 2, pointerEvents: 'none',
            }} />
            {/* Bottom fade */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H,
                background: 'linear-gradient(to top, rgba(10,14,26,0.95), transparent)',
                zIndex: 2, pointerEvents: 'none',
            }} />
            {/* Selection highlight bar */}
            <div style={{
                position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.18))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '10px',
                zIndex: 1, pointerEvents: 'none',
            }} />
            {/* Scrollable list */}
            <div
                ref={listRef}
                onScroll={handleScroll}
                style={{
                    height: '100%',
                    overflowY: 'scroll',
                    scrollSnapType: 'y mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingTop: ITEM_H,
                    paddingBottom: ITEM_H,
                }}
            >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                {items.map((item, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            onSelect(i);
                            if (listRef.current) listRef.current.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
                        }}
                        style={{
                            height: ITEM_H,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            scrollSnapAlign: 'start',
                            cursor: 'pointer',
                            fontSize: i === selectedIndex ? '1.1rem' : '0.95rem',
                            fontWeight: i === selectedIndex ? '700' : '400',
                            color: i === selectedIndex ? 'white' : 'rgba(148,163,184,0.45)',
                            transition: 'all 0.15s ease',
                            userSelect: 'none',
                            position: 'relative',
                            zIndex: 3,
                        }}
                    >
                        {formatItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TimeSlotPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Parse existing value or default to 9:00
    const parseValue = () => {
        if (value) {
            const [h, m] = value.split(':').map(Number);
            const hIdx = HOURS.indexOf(h);
            const mIdx = MINUTES.indexOf(String(m).padStart(2, '0'));
            return {
                hIdx: hIdx >= 0 ? hIdx : 1,
                mIdx: mIdx >= 0 ? mIdx : 0,
            };
        }
        return { hIdx: 1, mIdx: 0 }; // default 9:00
    };

    const [hIdx, setHIdx] = useState(() => parseValue().hIdx);
    const [mIdx, setMIdx] = useState(() => parseValue().mIdx);

    // Sync indices when value changes externally
    useEffect(() => {
        const p = parseValue();
        setHIdx(p.hIdx);
        setMIdx(p.mIdx);
    }, [value]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleConfirm = () => {
        const h = HOURS[hIdx];
        const m = MINUTES[mIdx];
        onChange(`${String(h).padStart(2, '0')}:${m}`);
        setOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setOpen(false);
    };

    const displayValue = value
        ? (() => {
            const [h, m] = value.split(':').map(Number);
            return formatDisplay(h, String(m).padStart(2, '0'));
        })()
        : null;

    const formatHour = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour} ${ampm}`;
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '20px', overflow: 'visible' }}>

            {/* Trigger button */}
            <motion.button
                type="button"
                onClick={() => setOpen(prev => !prev)}
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
                    {displayValue || 'Select a time slot'}
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} color="rgba(148,163,184,0.5)" />
                </motion.span>
            </motion.button>

            {/* Drum picker dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            background: 'rgba(10, 14, 26, 0.97)',
                            backdropFilter: 'blur(28px)',
                            WebkitBackdropFilter: 'blur(28px)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: '20px',
                            padding: '1rem 1rem 1rem',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                        }}
                    >
                        {/* Label */}
                        <p style={{
                            textAlign: 'center',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            letterSpacing: '1.5px',
                            color: 'rgba(148,163,184,0.4)',
                            textTransform: 'uppercase',
                            marginBottom: '0.6rem',
                        }}>
                            Scroll to select time
                        </p>

                        {/* Drums row */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}>
                            <Drum
                                items={HOURS}
                                selectedIndex={hIdx}
                                onSelect={setHIdx}
                                formatItem={formatHour}
                            />

                            <span style={{
                                fontSize: '1.6rem',
                                fontWeight: '800',
                                color: 'rgba(99,102,241,0.7)',
                                marginBottom: '2px',
                                lineHeight: 1,
                            }}>:</span>

                            <Drum
                                items={MINUTES}
                                selectedIndex={mIdx}
                                onSelect={setMIdx}
                                formatItem={(m) => m}
                            />
                        </div>

                        {/* Preview */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: '0.6rem',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px',
                        }}>
                            {formatDisplay(HOURS[hIdx], MINUTES[mIdx])}
                        </p>

                        {/* Action buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '0.7rem' }}>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.96 }}
                                onClick={handleClear}
                                style={{
                                    padding: '10px',
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    borderRadius: '12px',
                                    color: '#ef4444',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Clear
                            </motion.button>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.96 }}
                                onClick={handleConfirm}
                                style={{
                                    padding: '10px',
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.8))',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Check size={15} /> Confirm
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimeSlotPicker;
