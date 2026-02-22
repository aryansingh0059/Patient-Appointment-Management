import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';
import HospitalBackground from '../components/HospitalBackground';

const slideUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }
    })
};

const glass = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '18px',
};

const FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

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
            padding: '4px 12px', borderRadius: '20px', background: s.bg,
            color: s.color, border: `1px solid ${s.border}`,
            fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px',
        }}>
            {status.toUpperCase()}
        </span>
    );
};

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#ef4444'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Pending');
    const [lastSynced, setLastSynced] = useState('');

    const fetchAppointments = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, config);
            setAppointments(data);
            const now = new Date();
            setLastSynced(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        approved: appointments.filter(a => a.status === 'approved').length,
        rejected: appointments.filter(a => a.status === 'rejected').length,
    };

    const filtered = [...appointments].reverse().filter(app => {
        if (activeFilter === 'All') return true;
        return app.status === activeFilter.toLowerCase();
    });

    const STAT_CONFIG = [
        { label: 'TOTAL CASES', value: stats.total, color: '#6366f1' },
        { label: 'AWAITING ACTION', value: stats.pending, color: '#f59e0b' },
        { label: 'APPROVED', value: stats.approved, color: '#22c55e' },
        { label: 'REJECTED', value: stats.rejected, color: '#ef4444' },
    ];

    return (
        <>
            <HospitalBackground />
            <div className="dashboard-container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}
                >
                    <div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', color: 'white', marginBottom: '0.3rem' }}>
                            Admin Panel
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Welcome, Dr. {user.name} · All patient requests appear here in real-time
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        {lastSynced && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                📡 Last synced {lastSynced}
                            </span>
                        )}
                        <motion.button
                            onClick={fetchAppointments}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95, rotate: 180 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(99,102,241,0.12)', color: 'var(--primary)',
                                border: '1px solid rgba(99,102,241,0.25)', borderRadius: '10px',
                                padding: '7px 16px', cursor: 'pointer', fontWeight: '700',
                                fontSize: '0.85rem', transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                        >
                            <RefreshCw size={14} /> Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {STAT_CONFIG.map((s, i) => (
                        <motion.div
                            key={s.label}
                            custom={i}
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.03, y: -3 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                            style={{ ...glass, padding: '1.8rem 2rem', flex: '1', minWidth: '130px' }}
                        >
                            <div style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: '800', color: s.color, lineHeight: 1 }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '8px', letterSpacing: '0.8px' }}>
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Patient Appointment Requests */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
                    style={{ ...glass, padding: '1.8rem 2rem' }}
                >
                    {/* Section Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.6rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white', marginBottom: '4px' }}>
                                📋 Patient Appointment Requests
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                {stats.pending} pending · Accept or reject directly from here
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
                                        padding: '6px 16px', borderRadius: '9px', border: 'none',
                                        cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem',
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
                    </div>

                    {/* Appointment Rows */}
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.p
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2.5rem 0', fontSize: '0.9rem' }}
                            >
                                No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} appointments.
                            </motion.p>
                        ) : filtered.map((app, i) => (
                            <motion.div
                                key={app._id}
                                custom={i}
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem 1.2rem', borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    marginBottom: '0.6rem', gap: '1rem', flexWrap: 'wrap',
                                }}
                            >
                                {/* Left: Avatar + Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '200px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: avatarColor(app.patientName || ''),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '700', fontSize: '0.9rem', color: 'white', flexShrink: 0,
                                    }}>
                                        {initials(app.patientName)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem', marginBottom: '2px' }}>
                                            {app.patientName}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                            {app.department} · Dr. {app.doctorName?.replace('Dr. ', '')}
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Date + Time */}
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
                                    <span style={{ color: 'white', fontWeight: '600' }}>{formatDate(app.date)}</span>
                                    <span>🕐 {formatTime(app.timeSlot)}</span>
                                </div>

                                {/* Right: Status + Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    <StatusBadge status={app.status} />
                                    {app.status === 'pending' && (
                                        <>
                                            <motion.button
                                                onClick={() => updateStatus(app._id, 'approved')}
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    padding: '7px 16px', background: 'rgba(34,197,94,0.15)',
                                                    color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
                                                    borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
                                                    fontSize: '0.82rem', transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
                                            >
                                                <Check size={14} /> Approve
                                            </motion.button>
                                            <motion.button
                                                onClick={() => updateStatus(app._id, 'rejected')}
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.96 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    padding: '7px 16px', background: 'rgba(239,68,68,0.1)',
                                                    color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)',
                                                    borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
                                                    fontSize: '0.82rem', transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                            >
                                                <X size={14} /> Reject
                                            </motion.button>
                                        </>
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

export default DoctorDashboard;
