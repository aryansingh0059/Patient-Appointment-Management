import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, Clock, Activity } from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, config);
            setAppointments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`, { status }, config);
            fetchAppointments();
        } catch (err) {
            alert('Update failed');
        }
    };

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Hello, Dr. {user.name}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>You have {appointments.filter(a => a.status === 'pending').length} pending requests today.</p>
                </div>
                <div style={{ background: 'var(--glass)', padding: '10px 20px', borderRadius: '14px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Active Session</span>
                </div>
            </header>

            <div className="flex-responsive">
                {appointments.length === 0 ? (
                    <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                        <Clock size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <h3 style={{ color: 'var(--text-secondary)' }}>No appointments found.</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>New patient requests will appear here as they come in.</p>
                    </div>
                ) : [...appointments].reverse().map((app) => (
                    <motion.div
                        key={app._id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ y: -8 }}
                        className="glass-card flex-item-side"
                        style={{ padding: '2rem', borderTop: `4px solid ${app.status === 'approved' ? 'var(--primary)' : 'transparent'}`, minWidth: '350px', flex: '1 1 350px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.3rem' }}>{app.patientName}</h3>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    background: 'var(--primary-glow)',
                                    borderRadius: '8px',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    <Activity size={14} /> {app.department}
                                </div>
                            </div>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                background: app.status === 'approved' ? '#22c55e15' : app.status === 'rejected' ? '#ef444415' : '#eab30815',
                                color: app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#eab308'
                            }}>
                                {app.status.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '14px', border: '1px solid var(--glass-border)', display: 'flex', gap: '20px', marginBottom: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>DATE</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{app.date}</span>
                            </div>
                            <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                            <div style={{ flex: 1 }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>TIME</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{app.timeSlot}</span>
                            </div>
                        </div>

                        {app.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => updateStatus(app._id, 'approved')}
                                    className="btn"
                                    style={{ background: '#22c55e', color: 'white', flex: 1.2 }}
                                >
                                    <Check size={18} /> Confirm
                                </button>
                                <button
                                    onClick={() => updateStatus(app._id, 'rejected')}
                                    className="btn"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', flex: 0.8 }}
                                >
                                    <X size={18} /> Decline
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DoctorDashboard;
