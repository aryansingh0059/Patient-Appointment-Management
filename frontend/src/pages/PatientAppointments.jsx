import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import HospitalBackground from '../components/HospitalBackground';

const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const rowVariant = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1, x: 0,
        transition: { delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }
    })
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const glass = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
    const map = {
        pending: { bg: 'rgba(234,179,8,0.08)', color: '#eab308', border: 'rgba(234,179,8,0.2)', label: 'PENDING' },
        approved: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)', label: 'APPROVED' },
        rejected: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)', label: 'REJECTED' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            padding: '5px 14px', borderRadius: '24px', background: s.bg,
            color: s.color, border: `1px solid ${s.border}`,
            fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px',
            backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center',
        }}>
            {s.label}
        </span>
    );
};

const PatientAppointments = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchAppointments = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, config);
            setAppointments(data);
        } catch (err) { console.error(err); }
    }, [user.token]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const filtered = appointments.filter(app => {
        if (activeFilter === 'All') return true;
        return app.status === activeFilter.toLowerCase();
    });
    const reversed = [...filtered].reverse();

    return (
        <>
            <HospitalBackground />
            <motion.div
                className="dashboard-container"
                style={{ position: 'relative', zIndex: 1 }}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={slideUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: window.innerWidth < 768 ? '2.2rem' : '3rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.2rem' }}>
                            Medical Schedule
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem' }}>
                            Monitor the status of your medical consultations
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex', gap: '4px',
                        background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '5px',
                        border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
                    }}>
                        {FILTERS.map(f => (
                            <motion.button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '7px 18px', borderRadius: '10px', border: 'none',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                    transition: 'all 0.18s ease',
                                    background: activeFilter === f
                                        ? 'linear-gradient(135deg, rgba(99,102,241,0.6), rgba(168,85,247,0.6))'
                                        : 'transparent',
                                    color: activeFilter === f ? 'white' : 'var(--text-secondary)',
                                    boxShadow: activeFilter === f ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                                }}
                            >
                                {f}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div variants={slideUp} style={{ ...glass, overflow: 'hidden' }}>
                    {/* Header Row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.3fr 1fr',
                        padding: '1rem 1.8rem',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.02)',
                    }}>
                        {['Specialty', 'Practitioner', 'Date', 'Time Slot', 'Status'].map(h => (
                            <span key={h} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Data Rows */}
                    <AnimatePresence mode="wait">
                        {reversed.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ padding: '4rem', textAlign: 'center' }}
                            >
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    {activeFilter === 'All' ? 'No appointments found.' : `No ${activeFilter.toLowerCase()} appointments.`}
                                </p>
                            </motion.div>
                        ) : reversed.map((app, i) => (
                            <motion.div
                                key={app._id}
                                custom={i}
                                variants={rowVariant}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                style={{
                                    display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.3fr 1fr',
                                    padding: '1.1rem 1.8rem',
                                    borderBottom: i < reversed.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{app.department}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{app.doctorName}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{formatDate(app.date)}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{formatTime(app.timeSlot)}</span>
                                <StatusBadge status={app.status} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </>
    );
};

export default PatientAppointments;
