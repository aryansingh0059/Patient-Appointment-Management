import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import HospitalBackground from '../components/HospitalBackground';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const glass = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '20px',
};

const rowVariant = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }
    })
};

const formatTime = (t) => {
    if (!t) return '';
    if (t.includes('AM') || t.includes('PM')) return t;
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
    const map = {
        pending: { bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: 'rgba(234,179,8,0.25)' },
        approved: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)' },
        rejected: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            padding: '4px 14px', borderRadius: '20px', background: s.bg,
            color: s.color, border: `1px solid ${s.border}`,
            fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px',
        }}>
            {status.toUpperCase()}
        </span>
    );
};

const DoctorAppointments = () => {
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

    const updateStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`, { status }, config);
            fetchAppointments();
        } catch (err) { alert('Update failed'); }
    };

    const filtered = [...appointments].reverse().filter(app => {
        if (activeFilter === 'All') return true;
        return app.status === activeFilter.toLowerCase();
    });

    const COL_TEMPLATE = '2fr 1.8fr 1.5fr 1.3fr 1.4fr 2fr';

    return (
        <>
            <HospitalBackground />
            <div className="dashboard-container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}
                >
                    <div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', color: 'white', marginBottom: '0.3rem' }}>
                            Clinical Queue
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Review and manage your incoming patient cases
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex', gap: '4px',
                        background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px',
                        border: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
                    }}>
                        {FILTERS.map(f => (
                            <motion.button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '7px 18px', borderRadius: '9px', border: 'none',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                    transition: 'all 0.15s ease',
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                    style={{ ...glass, overflow: 'hidden' }}
                >
                    {/* Column Headers */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: COL_TEMPLATE,
                        padding: '1rem 2rem',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.02)',
                    }}>
                        {['Specialty', 'Patient', 'Date', 'Time Slot', 'Status', 'Action Control'].map(h => (
                            <span key={h} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
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
                        ) : filtered.map((app, i) => (
                            <motion.div
                                key={app._id}
                                custom={i}
                                variants={rowVariant}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                style={{
                                    display: 'grid', gridTemplateColumns: COL_TEMPLATE,
                                    padding: '1.2rem 2rem',
                                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    alignItems: 'center', gap: '0.5rem',
                                }}
                            >
                                <span style={{ fontWeight: '600', color: 'white', fontSize: '0.9rem' }}>{app.department}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{app.patientName}</span>
                                <span style={{ color: 'white', fontWeight: '600', fontSize: '0.88rem' }}>{formatDate(app.date)}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{formatTime(app.timeSlot)}</span>
                                <StatusBadge status={app.status} />
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {app.status === 'pending' ? (
                                        <>
                                            <motion.button
                                                onClick={() => updateStatus(app._id, 'approved')}
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    padding: '6px 14px', background: 'rgba(34,197,94,0.15)',
                                                    color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
                                                    borderRadius: '9px', cursor: 'pointer', fontWeight: '700',
                                                    fontSize: '0.8rem', transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
                                            >
                                                <Check size={13} /> Approve
                                            </motion.button>
                                            <motion.button
                                                onClick={() => updateStatus(app._id, 'rejected')}
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    padding: '6px 14px', background: 'rgba(239,68,68,0.1)',
                                                    color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)',
                                                    borderRadius: '9px', cursor: 'pointer', fontWeight: '700',
                                                    fontSize: '0.8rem', transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                            >
                                                <X size={13} /> Reject
                                            </motion.button>
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                            ✓ Processed
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    );
};

export default DoctorAppointments;
