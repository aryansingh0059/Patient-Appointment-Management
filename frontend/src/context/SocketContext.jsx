import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

// Simple Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '380px',
            width: 'calc(100% - 48px)',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        style={{
                            pointerEvents: 'auto',
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '16px',
                            padding: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Progress Bar background decoration */}
                        <motion.div 
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <h4 style={{ margin: 0, color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{t.title}</h4>
                            <button 
                                onClick={() => removeToast(t.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    lineHeight: 1,
                                    padding: 0
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', lineHeight: 1.4 }}>{t.message}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [toasts, setToasts] = useState([]);
    
    // Load user-specific notifications from localStorage
    const [notifications, setNotifications] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`notifications_${user._id}`);
        return saved ? JSON.parse(saved) : [];
    });

    const addNotification = useCallback((title, message) => {
        const newNotif = {
            id: Date.now().toString(),
            title,
            message,
            time: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const showToast = useCallback((title, message) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, title, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setNotifications([]);
            setToasts([]);
            return;
        }

        // Initialize user notifications
        const saved = localStorage.getItem(`notifications_${user._id}`);
        setNotifications(saved ? JSON.parse(saved) : []);

        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: {
                token: user.token
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Socket.IO connection established');
        });

        newSocket.on('disconnect', () => {
            console.log('Socket.IO connection disconnected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Save notifications to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem(`notifications_${user._id}`, JSON.stringify(notifications));
        }
    }, [notifications, user]);

    // Global listener for backend socket events
    useEffect(() => {
        if (!socket || !user) return;

        const handleAppointmentBooked = (appointment) => {
            if (user.role === 'doctor') {
                const title = "New Appointment Booked 📅";
                const message = `Patient ${appointment.patientName} has booked a slot for ${appointment.department} on ${appointment.date}.`;
                addNotification(title, message);
                showToast(title, message);
            }
        };

        const handleStatusChanged = (appointment) => {
            if (user.role === 'patient' && appointment.patientId === user._id) {
                const statusUpper = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
                const emoji = appointment.status === 'approved' ? '🎉' : appointment.status === 'rejected' ? '❌' : '📋';
                const title = `Appointment ${statusUpper}! ${emoji}`;
                const message = `Your appointment for ${appointment.department} with ${appointment.doctorName} has been ${appointment.status}.`;
                addNotification(title, message);
                showToast(title, message);
            } else if (user.role === 'doctor') {
                const statusUpper = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
                const title = `Appointment Status Updated 📋`;
                const message = `Appointment for ${appointment.patientName} (${appointment.department}) is now ${appointment.status}.`;
                addNotification(title, message);
                showToast(title, message);
            }
        };

        socket.on('appointment_booked', handleAppointmentBooked);
        socket.on('appointment_status_changed', handleStatusChanged);

        return () => {
            socket.off('appointment_booked', handleAppointmentBooked);
            socket.off('appointment_status_changed', handleStatusChanged);
        };
    }, [socket, user, addNotification, showToast]);

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <SocketContext.Provider value={{
            socket,
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll
        }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </SocketContext.Provider>
    );
};
