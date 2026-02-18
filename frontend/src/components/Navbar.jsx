import React, { useContext, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = memo(() => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

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
                padding: window.innerWidth < 768 ? '0.8rem 1rem' : '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '8px' : '12px' }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        padding: window.innerWidth < 768 ? '6px' : '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <span style={{
                            fontSize: window.innerWidth < 768 ? '22px' : '28px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
                            lineHeight: '1',
                            display: 'inline-block',
                            transform: 'scale(1.3, 1)'
                        }}>
                            ☤
                        </span>
                    </div>
                    <h2 className="gradient-text" style={{
                        margin: 0,
                        fontSize: window.innerWidth < 768 ? '1.2rem' : '1.6rem',
                        fontWeight: '800'
                    }}>QuickCure</h2>
                </div>

                {/* Nav Actions */}
                <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '12px' : '20px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {window.innerWidth > 480 && (
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                    Hi, <strong style={{ color: 'white' }}>{user.name}</strong>
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: window.innerWidth < 768 ? '6px 12px' : '8px 18px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                                <LogOut size={window.innerWidth < 768 ? 14 : 16} />
                                {window.innerWidth > 480 ? 'Logout' : ''}
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
