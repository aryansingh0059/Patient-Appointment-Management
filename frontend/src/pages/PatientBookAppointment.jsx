import React, { useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import HospitalBackground from '../components/HospitalBackground';

const DEPARTMENT_DOCTORS = {
    Cardiology: ['Dr. Priya Sharma', 'Dr. Rajesh Mehta', 'Dr. Ananya Iyer', 'Dr. Vikram Singh'],
    Neurology: ['Dr. Sneha Kapoor', 'Dr. Arjun Nair', 'Dr. Divya Reddy', 'Dr. Suresh Pillai'],
    Orthopedics: ['Dr. Meera Joshi', 'Dr. Karan Malhotra', 'Dr. Pooja Verma', 'Dr. Amit Bose'],
    General: ['Dr. Neha Gupta', 'Dr. Rohit Desai', 'Dr. Kavya Nambiar', 'Dr. Sanjay Patil'],
    Dermatology: ['Dr. Ritu Agarwal', 'Dr. Manish Khanna', 'Dr. Swati Rao', 'Dr. Deepak Tiwari'],
    Endocrinology: ['Dr. Shreya Nair', 'Dr. Arun Pillai', 'Dr. Lakshmi Iyer', 'Dr. Harsh Bose'],
    Gastroenterology: ['Dr. Amit Desai', 'Dr. Priyanka Mehta', 'Dr. Rajiv Nair', 'Dr. Sunita Patel'],
};

const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
    '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM',
];

const getTodayDate = () => new Date().toISOString().split('T')[0];

const DEPT_ICONS = {
    Cardiology: '❤️', Neurology: '🧠', Orthopedics: '🦴', General: '🩺',
    Dermatology: '✨', Endocrinology: '⚗️', Gastroenterology: '🫁',
};

const DR_ICONS = ['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️'];

const glass = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
};

const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const PatientBookAppointment = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookedAppointment, setBookedAppointment] = useState(null);
    const [formData, setFormData] = useState({
        department: 'Cardiology',
        doctorName: DEPARTMENT_DOCTORS['Cardiology'][0],
        date: getTodayDate(),
        timeSlot: '',
    });

    const handleDeptChange = useCallback((dept) => {
        setFormData(prev => ({ ...prev, department: dept, doctorName: DEPARTMENT_DOCTORS[dept][0] }));
    }, []);

    // Convert display slot (09:00 AM) → stored 24h format
    const displayToStored = (slot) => {
        if (!slot) return '';
        const [time, ampm] = slot.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (isSubmitting || !formData.timeSlot) return;
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = { ...formData, timeSlot: displayToStored(formData.timeSlot), patientName: user.name };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments`, payload, config);
            setBookedAppointment(data);
            setFormData(prev => ({ ...prev, timeSlot: '' }));
            setTimeout(() => { setBookedAppointment(null); navigate('/patient/appointments'); }, 4000);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableDoctors = DEPARTMENT_DOCTORS[formData.department] || [];
    const docIndex = availableDoctors.indexOf(formData.doctorName);
    const drIcon = DR_ICONS[docIndex % DR_ICONS.length];

    return (
        <>
            <HospitalBackground />
            <div className="dashboard-container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.header variants={slideUp} initial="hidden" animate="visible" style={{ marginBottom: '2rem' }}>
                    <h1 className="gradient-text" style={{ fontSize: window.innerWidth < 768 ? '2.2rem' : '3rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.2rem' }}>
                        Book an Appointment
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem' }}>
                        Select your department and preferred doctor
                    </p>
                </motion.header>

                {/* Success Toast */}
                <AnimatePresence>
                    {bookedAppointment && (
                        <motion.div
                            key="toast"
                            initial={{ opacity: 0, y: -40, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            style={{
                                marginBottom: '2rem', padding: '1.5rem 2rem',
                                background: 'rgba(34, 197, 94, 0.05)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '20px',
                                display: 'flex', alignItems: 'center', gap: '1.5rem',
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.1 }}
                                style={{ fontSize: '1.8rem' }}
                            >✅</motion.div>
                            <div>
                                <h3 style={{ color: '#22c55e', fontWeight: '700', marginBottom: '4px' }}>Appointment Confirmed! 🎉</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span>🏥 <strong style={{ color: 'white' }}>{bookedAppointment.department}</strong></span>
                                    <span>👨‍⚕️ <strong style={{ color: 'white' }}>{bookedAppointment.doctorName}</strong></span>
                                    <span>📅 <strong style={{ color: 'white' }}>{bookedAppointment.date}</strong></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
                    style={{ ...glass, padding: window.innerWidth < 768 ? '1.5rem' : '2.5rem', maxWidth: '860px' }}
                >
                    <form onSubmit={handleBook}>
                        {/* Row 1 */}
                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label><span>📅</span> Specialist Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => handleDeptChange(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
                                >
                                    {Object.keys(DEPARTMENT_DOCTORS).map(dept => (
                                        <option key={dept} value={dept} style={{ background: '#0f1221', color: 'white' }}>
                                            {DEPT_ICONS[dept] || '🏥'} {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label><span>👤</span> Select Practitioner</label>
                                <select
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
                                >
                                    {availableDoctors.map(doc => (
                                        <option key={doc} value={doc} style={{ background: '#0f1221', color: 'white' }}>{doc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label><Calendar size={13} /> Preferred Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    min={getTodayDate()}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                            </div>
                            <div>
                                <label><Clock size={13} /> Available Time</label>
                                <select
                                    value={formData.timeSlot}
                                    onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                                    required
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
                                        borderColor: formData.timeSlot ? 'var(--primary)' : undefined,
                                        boxShadow: formData.timeSlot ? '0 0 0 4px rgba(99,102,241,0.2)' : undefined,
                                    }}
                                >
                                    <option value="" disabled style={{ background: '#0f1221', color: 'rgba(148,163,184,0.6)' }}>Select a slot</option>
                                    {TIME_SLOTS.map(slot => (
                                        <option key={slot} value={slot} style={{ background: '#0f1221', color: 'white' }}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Doctor Preview */}
                        {formData.doctorName && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                                    marginBottom: '1.8rem',
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>{drIcon}</span>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{formData.doctorName}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{formData.department} Specialist</div>
                                </div>
                            </motion.div>
                        )}

                        {/* Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <motion.button
                                type="button"
                                onClick={() => navigate('/patient')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    padding: '14px', background: 'rgba(255,255,255,0.04)',
                                    color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '14px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!formData.timeSlot || isSubmitting}
                                whileHover={formData.timeSlot && !isSubmitting ? { scale: 1.03, y: -2 } : {}}
                                whileTap={formData.timeSlot && !isSubmitting ? { scale: 0.97 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{
                                    padding: '14px',
                                    opacity: (!formData.timeSlot || isSubmitting) ? 0.5 : 1,
                                    cursor: (!formData.timeSlot || isSubmitting) ? 'not-allowed' : 'pointer',
                                    fontSize: '0.95rem',
                                }}
                            >
                                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default PatientBookAppointment;
