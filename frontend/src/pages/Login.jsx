import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import HospitalBackground from '../components/HospitalBackground';

const TRUST_BADGES = [
    { icon: '🔒', label: 'HIPAA Compliant' },
    { icon: '🏥', label: 'Verified Doctors' },
    { icon: '⚡', label: '24/7 Support' },
];

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
            login(data);
            navigate(data.role === 'doctor' ? '/doctor' : '/patient');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <HospitalBackground />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px' }}>

                {/* Top brand strip */}
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

                {/* Main card */}
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
                    {/* Header */}
                    <div style={{ marginBottom: window.innerWidth < 768 ? '1.5rem' : '2rem' }}>
                        <h2 style={{ fontSize: window.innerWidth < 768 ? '1.6rem' : '1.9rem', fontWeight: '800', color: 'white', marginBottom: '0.4rem' }}>
                            Welcome Back 👋
                        </h2>
                        <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem' }}>
                            Sign in to manage your appointments securely.
                        </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                                    color: '#fca5a5', padding: '12px 16px', borderRadius: '12px',
                                    marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.82rem', color: 'rgba(148,163,184,0.8)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                📧 Email Address
                            </label>
                            <input
                                type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required placeholder="name@example.com"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', width: '100%', padding: '14px 16px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.82rem', color: 'rgba(148,163,184,0.8)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                🔑 Password
                            </label>
                            <input
                                type="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required placeholder="••••••••"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', width: '100%', padding: '14px 16px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                            />
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
                            {loading ? '⏳ Signing In...' : '→ Sign In Securely'}
                        </motion.button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem' }}>
                            New to QuickCure?{' '}
                            <Link to="/register" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: '700' }}>
                                Create Account →
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.8rem', flexWrap: 'wrap' }}
                >
                    {TRUST_BADGES.map((b, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px', padding: '6px 14px',
                            fontSize: '0.78rem', color: 'rgba(148,163,184,0.7)', fontWeight: '600'
                        }}>
                            <span>{b.icon}</span> {b.label}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
