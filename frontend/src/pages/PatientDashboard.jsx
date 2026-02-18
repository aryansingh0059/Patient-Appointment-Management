import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User as UserIcon, Stethoscope } from 'lucide-react';
import TimeSlotPicker from '../components/TimeSlotPicker';
import HospitalBackground from '../components/HospitalBackground';

const DEPARTMENT_DOCTORS = {
    Cardiology: ['Dr. Priya Sharma', 'Dr. Rajesh Mehta', 'Dr. Ananya Iyer', 'Dr. Vikram Singh'],
    Neurology: ['Dr. Sneha Kapoor', 'Dr. Arjun Nair', 'Dr. Divya Reddy', 'Dr. Suresh Pillai'],
    Orthopedics: ['Dr. Meera Joshi', 'Dr. Karan Malhotra', 'Dr. Pooja Verma', 'Dr. Amit Bose'],
    General: ['Dr. Neha Gupta', 'Dr. Rohit Desai', 'Dr. Kavya Nambiar', 'Dr. Sanjay Patil'],
    Dermatology: ['Dr. Ritu Agarwal', 'Dr. Manish Khanna', 'Dr. Swati Rao', 'Dr. Deepak Tiwari'],
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const slideUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1, x: 0,
        transition: { delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }
    })
};

// Ultra-transparent glass style
const glass = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
};

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [bookedAppointment, setBookedAppointment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        department: 'Cardiology',
        doctorName: DEPARTMENT_DOCTORS['Cardiology'][0],
        date: getTodayDate(),
        timeSlot: ''
    });

    const fetchAppointments = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, config);
            setAppointments(data);
        } catch (err) { console.error(err); }
    }, [user.token]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const handleDepartmentChange = useCallback((dept) => {
        setFormData(prev => ({ ...prev, department: dept, doctorName: DEPARTMENT_DOCTORS[dept][0] }));
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments`, { ...formData, patientName: user.name }, config);
            // Reset time slot so the button becomes disabled and form is fresh
            setFormData(prev => ({ ...prev, timeSlot: '' }));
            fetchAppointments();
            setBookedAppointment(data);
            setTimeout(() => setBookedAppointment(null), 6000);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableDoctors = DEPARTMENT_DOCTORS[formData.department] || [];

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
                <motion.header variants={slideUpVariants} style={{ marginBottom: '2rem' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.2rem', letterSpacing: '-1px' }}>
                        Patient Workspace
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome, {user.name}. Schedule your next visit below.</p>
                </motion.header>

                {/* Booking Confirmation Toast */}
                <AnimatePresence>
                    {bookedAppointment && (
                        <motion.div
                            key="confirmation"
                            initial={{ opacity: 0, y: -40, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            style={{
                                marginBottom: '2rem',
                                padding: '2rem 2.5rem',
                                background: 'rgba(34, 197, 94, 0.05)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                                flexWrap: 'wrap',
                                position: 'relative',
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                                style={{
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, fontSize: '1.6rem'
                                }}
                            >✓</motion.div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: '#22c55e', fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                    Appointment Confirmed! 🎉
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span>🏥 <strong style={{ color: 'white' }}>{bookedAppointment.department}</strong></span>
                                    <span>👨‍⚕️ <strong style={{ color: 'white' }}>{bookedAppointment.doctorName}</strong></span>
                                    <span>📅 <strong style={{ color: 'white' }}>{bookedAppointment.date}</strong></span>
                                    <span>🕐 <strong style={{ color: 'white' }}>{bookedAppointment.timeSlot}</strong></span>
                                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: 'rgba(234,179,8,0.08)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)', fontWeight: '700', fontSize: '0.75rem' }}>PENDING</span>
                                </div>
                            </div>
                            <button onClick={() => setBookedAppointment(null)} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-responsive">
                    {/* Booking Form — ultra transparent */}
                    <motion.div
                        variants={slideUpVariants}
                        className="flex-item-side"
                        style={{
                            ...glass,
                            padding: '2.5rem',
                            height: 'fit-content',
                            overflow: 'visible',
                        }}
                    >
                        <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={22} /> Book Appointment
                        </h3>
                        <form onSubmit={handleBook}>
                            <label>Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
                            >
                                <option value="Cardiology" style={{ background: '#0f1221', color: 'white' }}>❤️ Cardiology</option>
                                <option value="Neurology" style={{ background: '#0f1221', color: 'white' }}>🧠 Neurology</option>
                                <option value="Orthopedics" style={{ background: '#0f1221', color: 'white' }}>🦴 Orthopedics</option>
                                <option value="General" style={{ background: '#0f1221', color: 'white' }}>🩺 General Physician</option>
                                <option value="Dermatology" style={{ background: '#0f1221', color: 'white' }}>✨ Dermatology</option>
                            </select>

                            <label>Select Doctor</label>
                            <select
                                value={formData.doctorName}
                                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                required
                                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
                            >
                                {availableDoctors.map(doc => (
                                    <option key={doc} value={doc} style={{ background: '#0f1221', color: 'white' }}>{doc}</option>
                                ))}
                            </select>

                            <div>
                                <label>Time Slot</label>
                                <TimeSlotPicker
                                    value={formData.timeSlot}
                                    onChange={(slot) => setFormData({ ...formData, timeSlot: slot })}
                                />
                            </div>
                            <div>
                                <label>Preferred Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    min={getTodayDate()}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    opacity: (!formData.timeSlot || isSubmitting) ? 0.5 : 1,
                                    cursor: (!formData.timeSlot || isSubmitting) ? 'not-allowed' : 'pointer',
                                }}
                                disabled={!formData.timeSlot || isSubmitting}
                                whileHover={formData.timeSlot && !isSubmitting ? { scale: 1.03, y: -2 } : {}}
                                whileTap={formData.timeSlot && !isSubmitting ? { scale: 0.97 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                Schedule Appointment
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Appointments List */}
                    <motion.div variants={slideUpVariants} className="flex-item-main">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '700' }}>Recent History</h2>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{
                                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                                    background: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    padding: '6px 14px', borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}
                            >
                                Recent Appointments
                            </motion.span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <AnimatePresence>
                                {appointments.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        style={{
                                            ...glass,
                                            padding: '3rem',
                                            textAlign: 'center',
                                            borderStyle: 'dashed',
                                            background: 'rgba(255,255,255,0.02)',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                        >
                                            <UserIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                        </motion.div>
                                        <p style={{ color: 'var(--text-secondary)' }}>You don't have any appointments yet.</p>
                                    </motion.div>
                                ) : (
                                    [...appointments].reverse().slice(0, 6).map((app, i) => (
                                        <motion.div
                                            key={app._id}
                                            custom={i}
                                            variants={listItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover={{ scale: 1.015, x: 6 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                            style={{
                                                ...glass,
                                                padding: '1.6rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                cursor: 'default',
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <motion.div
                                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                                    style={{
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        backdropFilter: 'blur(8px)',
                                                        WebkitBackdropFilter: 'blur(8px)',
                                                        padding: '10px',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(99,102,241,0.15)'
                                                    }}
                                                >
                                                    <Stethoscope size={22} color="var(--primary)" />
                                                </motion.div>
                                                <div>
                                                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.3rem' }}>{app.department}</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><UserIcon size={13} /> {app.doctorName}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {app.date}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> {app.timeSlot}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.7 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.08 + 0.2 }}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '24px',
                                                    fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px',
                                                    background: app.status === 'approved' ? 'rgba(34,197,94,0.08)' : app.status === 'rejected' ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)',
                                                    color: app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#eab308',
                                                    border: `1px solid ${app.status === 'approved' ? 'rgba(34,197,94,0.2)' : app.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
                                                    backdropFilter: 'blur(4px)',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {app.status.toUpperCase()}
                                            </motion.span>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default PatientDashboard;
