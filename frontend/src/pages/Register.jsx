import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import HospitalBackground from '../components/HospitalBackground';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', width: '100%',
        padding: '14px 16px', color: 'white',
        fontSize: '0.95rem', outline: 'none',
    };

    const labelStyle = {
        display: 'block', marginBottom: '8px',
        fontSize: '0.82rem', color: 'rgba(148,163,184,0.8)',
        fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase',
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <HospitalBackground />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}>

                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center', marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem' }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: window.innerWidth < 768 ? '1.6rem' : '2rem' }}>☤</span>
                        <span style={{
                            fontSize: window.innerWidth < 768 ? '1.3rem' : '1.6rem', fontWeight: '800',
                            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>QuickCure</span>
                    </div>
                    <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: window.innerWidth < 768 ? '0.7rem' : '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        Trusted Healthcare Platform
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '28px',
                        padding: window.innerWidth < 768 ? '1.8rem' : '2.8rem',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
                    }}
                >
                    <div style={{ marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem' }}>
                        <h2 style={{ fontSize: window.innerWidth < 768 ? '1.6rem' : '1.9rem', fontWeight: '800', color: 'white', marginBottom: '0.4rem' }}>
                            Join QuickCure 🏥
                        </h2>
                        <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem' }}>
                            Create your account and start managing your health today.
                        </p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                                    color: '#fca5a5', padding: '12px 16px', borderRadius: '12px',
                                    marginBottom: '1.5rem', fontSize: '0.88rem'
                                }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={labelStyle}>👤 Full Name</label>
                            <input type="text" value={formData.name} onChange={set('name')} required placeholder="Enter your full name" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={labelStyle}>📧 Email Address</label>
                            <input type="email" value={formData.email} onChange={set('email')} required placeholder="name@example.com" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={labelStyle}>🔑 Password</label>
                            <input type="password" value={formData.password} onChange={set('password')} required placeholder="Create a strong password" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={labelStyle}>🩺 I am a</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {['patient', 'doctor'].map(role => (
                                    <motion.button
                                        key={role}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role })}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '14px',
                                            border: formData.role === role ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                                            background: formData.role === role ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                            color: formData.role === role ? '#a5b4fc' : 'rgba(148,163,184,0.7)',
                                            fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                                            boxShadow: formData.role === role ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {role === 'patient' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            style={{
                                width: '100%', padding: '15px',
                                background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                border: 'none', borderRadius: '14px', color: 'white',
                                fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? '⏳ Creating Account...' : '→ Create Account'}
                        </motion.button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem' }}>
                            Already a member?{' '}
                            <Link to="/login" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: '700' }}>
                                Sign In →
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Privacy note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(148,163,184,0.4)', fontSize: '0.78rem' }}
                >
                    🔒 Your data is encrypted and protected under HIPAA guidelines.
                </motion.p>
            </div>
        </div>
    );
};

export default Register;
