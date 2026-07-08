import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const timeAgo = (dateString) => {
    try {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    } catch (e) {
        return '';
    }
};

const NotificationDropdown = () => {
    const { notifications, markAsRead, markAllAsRead, clearAll } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Icon Trigger */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    outline: 'none',
                    transition: 'border 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
                <Bell size={20} />
                
                {/* Unread Counter Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            exit={{ scale: 0 }}
                            transition={{ 
                                scale: { duration: 0.3 }, 
                                repeat: Infinity, 
                                repeatDelay: 4, 
                                duration: 1.2 
                            }}
                            style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                borderRadius: '50%',
                                minWidth: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                                pointerEvents: 'none'
                            }}
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        style={{
                            position: 'absolute',
                            right: 0,
                            marginTop: '10px',
                            width: '320px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                            zIndex: 10000,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'white', fontWeight: '700' }}>
                                Notifications
                            </h3>
                            {notifications.length > 0 && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={markAllAsRead}
                                        title="Mark all as read"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 0,
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                                    >
                                        <Eye size={15} />
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        title="Clear all"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 0,
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{
                                    padding: '30px 20px',
                                    textAlign: 'center',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '0.85rem'
                                }}>
                                    No notifications yet.
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            onClick={() => markAsRead(n.id)}
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                cursor: 'pointer',
                                                background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                                display: 'flex',
                                                gap: '12px',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
                                        >
                                            {/* Unread indicator */}
                                            {!n.read && (
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: '#6366f1',
                                                    marginTop: '6px',
                                                    flexShrink: 0
                                                }} />
                                            )}
                                            <div style={{ flex: 1, marginLeft: n.read ? '18px' : '0px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'baseline',
                                                    gap: '8px',
                                                    marginBottom: '2px'
                                                }}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700',
                                                        color: 'white'
                                                    }}>{n.title}</span>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        color: 'rgba(255,255,255,0.4)',
                                                        flexShrink: 0
                                                    }}>{timeAgo(n.time)}</span>
                                                </div>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255,255,255,0.6)',
                                                    lineHeight: 1.4
                                                }}>{n.message}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
