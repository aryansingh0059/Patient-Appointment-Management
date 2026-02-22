import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, User as UserIcon, Stethoscope, Clock } from 'lucide-react';
import HospitalBackground from '../components/HospitalBackground';

const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};

const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const cardLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1, x: 0,
        transition: { delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }
    })
};

const glass = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
};

const STAT_CONFIG = [
    { label: 'TOTAL VISITS', key: 'total', color: 'var(--primary)' },
    { label: 'PENDING', key: 'pending', color: '#f59e0b' },
    { label: 'CONFIRMED', key: 'confirmed', color: '#22c55e' },
    { label: 'CANCELLED', key: 'cancelled', color: '#ef4444' },
];

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, config);
            setAppointments(data);
        } catch (err) { console.error(err); }
    }, [user.token]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'approved').length,
        cancelled: appointments.filter(a => a.status === 'rejected').length,
    };

    const recentApps = [...appointments].reverse().slice(0, 3);

    const getStatusStyle = (status) => {
        const map = {
            pending: { bg: 'rgba(234,179,8,0.08)', color: '#eab308', border: 'rgba(234,179,8,0.2)' },
            approved: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
            rejected: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
        };
        return map[status] || map.pending;
    };

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
                <motion.header variants={slideUp} style={{ marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="gradient-text" style={{
                                fontSize: window.innerWidth < 768 ? '2.2rem' : '3rem',
                                fontWeight: '800', marginBottom: '0.2rem', letterSpacing: '-1px'
                            }}>
                                Welcome back, {user.name}!
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem' }}>
                                Manage your path to wellness today
                            </p>
                        </div>
                        <motion.button
                            onClick={() => navigate('/patient/book')}
                            className="btn btn-primary"
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            + Book Appointment
                        </motion.button>
                    </div>
                </motion.header>

                {/* Stat Cards */}
                <motion.div
                    variants={slideUp}
                    style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem', flexWrap: 'wrap' }}
                >
                    {STAT_CONFIG.map((s, i) => (
                        <motion.div
                            key={s.key}
                            custom={i}
                            variants={cardLeft}
                            whileHover={{ scale: 1.03, y: -3 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                            style={{
                                ...glass,
                                padding: '1.6rem 2rem',
                                flex: '1', minWidth: '140px',
                                borderLeft: `3px solid ${s.color}`,
                            }}
                        >
                            <div style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: '800', color: s.color, lineHeight: 1 }}>
                                {stats[s.key]}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '6px', letterSpacing: '0.8px' }}>
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Recent + Quick Actions */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Recent Appointments */}
                    <motion.div variants={slideUp} style={{ ...glass, flex: '2', minWidth: '300px', padding: '1.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
                            <h3 className="gradient-text" style={{ fontWeight: '700', fontSize: '1.1rem' }}>Recent Appointments</h3>
                            <motion.button
                                onClick={() => navigate('/patient/appointments')}
                                whileHover={{ x: 3 }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                                See all →
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {recentApps.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
                                        <UserIcon size={40} style={{ opacity: 0.15, marginBottom: '0.8rem' }} />
                                    </motion.div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No appointments yet.</p>
                                </motion.div>
                            ) : recentApps.map((app, i) => {
                                const st = getStatusStyle(app.status);
                                return (
                                    <motion.div
                                        key={app._id}
                                        custom={i}
                                        variants={cardLeft}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover={{ scale: 1.01, x: 4 }}
                                        style={{
                                            padding: '1rem 1.2rem',
                                            borderRadius: '14px',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            background: 'rgba(255,255,255,0.03)',
                                            marginBottom: '0.75rem',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <motion.div
                                                whileHover={{ rotate: 15, scale: 1.1 }}
                                                style={{
                                                    background: 'rgba(99,102,241,0.1)', padding: '8px', borderRadius: '10px',
                                                    border: '1px solid rgba(99,102,241,0.15)', flexShrink: 0,
                                                }}
                                            >
                                                <Stethoscope size={18} color="var(--primary)" />
                                            </motion.div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '2px' }}>{app.department}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{app.doctorName}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px', display: 'flex', gap: '10px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />{app.date}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} />{app.timeSlot}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{ padding: '5px 12px', borderRadius: '20px', background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.5px', flexShrink: 0 }}>
                                            {app.status.toUpperCase()}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={slideUp} style={{ ...glass, flex: '1', minWidth: '240px', padding: '1.8rem' }}>
                        <h3 className="gradient-text" style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.4rem' }}>Quick Actions</h3>

                        {[
                            { icon: '➕', label: 'Book New Appointment', onClick: () => navigate('/patient/book') },
                            { icon: '📋', label: 'View Medical Records', onClick: () => navigate('/patient/appointments') },
                        ].map((action, i) => (
                            <motion.button
                                key={i}
                                onClick={action.onClick}
                                whileHover={{ x: 4, background: 'rgba(99,102,241,0.1)' }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                                    cursor: 'pointer', marginBottom: '0.75rem', textAlign: 'left',
                                    fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <span style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                                }}>{action.icon}</span>
                                {action.label}
                            </motion.button>
                        ))}

                        <div style={{ marginTop: '1rem', padding: '12px 14px', background: 'rgba(234,179,8,0.05)', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ fontSize: '1rem' }}>💡</span>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Pro-tip: You can cancel appointments up to 24 hours before your scheduled time.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default PatientDashboard;
