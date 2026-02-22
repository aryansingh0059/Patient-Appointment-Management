import React, { useContext, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = memo(() => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

    const patientTabs = [
        { label: 'Dashboard', path: '/patient' },
        { label: 'Book Appointment', path: '/patient/book' },
        { label: 'Appointments', path: '/patient/appointments' },
    ];

    const doctorTabs = [
        { label: 'Dashboard', path: '/doctor' },
        { label: 'Appointments', path: '/doctor/appointments' },
    ];

    const tabs = user?.role === 'patient' ? patientTabs : user?.role === 'doctor' ? doctorTabs : [];

    const isActive = (path) => {
        const base = path.split('/').slice(0, 3).join('/');
        if (path === '/patient' || path === '/doctor') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(base);
    };

    const isMobile = window.innerWidth < 768;

    return (
        <nav style={{
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'rgba(7, 11, 20, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
            <div style={{
                width: '100%',
                padding: isMobile ? '0.8rem 1rem' : '0.85rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        padding: isMobile ? '6px' : '8px',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{
                            fontSize: isMobile ? '22px' : '28px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
                            lineHeight: '1', display: 'inline-block', transform: 'scale(1.3, 1)',
                        }}>
                            ☤
                        </span>
                    </div>
                    <h2 className="gradient-text" style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: '800' }}>
                        QuickCure
                    </h2>
                </div>

                {/* Nav Tabs */}
                {tabs.length > 0 && (
                    <div style={{
                        display: 'flex', gap: '4px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '12px', padding: '4px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        flexShrink: 0,
                    }}>
                        {tabs.map((tab) => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                style={{
                                    padding: isMobile ? '5px 10px' : '6px 16px',
                                    borderRadius: '9px',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                                    textDecoration: 'none',
                                    transition: 'all 0.18s ease',
                                    background: isActive(tab.path)
                                        ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))'
                                        : 'transparent',
                                    color: isActive(tab.path) ? 'white' : 'rgba(255,255,255,0.5)',
                                    border: isActive(tab.path)
                                        ? '1px solid rgba(99,102,241,0.4)'
                                        : '1px solid transparent',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side — user info + logout */}
                <div style={{ display: 'flex', gap: isMobile ? '12px' : '20px', alignItems: 'center', flexShrink: 0 }}>
                    {user ? (
                        <>
                            {/* Avatar */}
                            {!isMobile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '700', fontSize: '0.9rem', color: 'white',
                                        flexShrink: 0,
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ lineHeight: 1.3 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {user.role}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: isMobile ? '6px 12px' : '8px 18px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    borderRadius: '8px', cursor: 'pointer',
                                    fontWeight: '600', fontSize: '0.85rem',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                                <LogOut size={isMobile ? 14 : 16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
});

Navbar.displayName = 'Navbar';
export default Navbar;
