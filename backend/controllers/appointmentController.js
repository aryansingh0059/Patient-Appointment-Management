const Appointment = require('../models/appointmentModel');

const createAppointment = async (req, res, next) => {
    try {
        const { department, doctorName, patientName, date, timeSlot } = req.body;
        if (req.user.role !== 'patient') {
            res.status(403);
            throw new Error('Only patients can book');
        }
        if (!department || !doctorName || !patientName || !date || !timeSlot) {
            res.status(400);
            throw new Error('Please provide all appointment details');
        }
        const appointment = await Appointment.create({
            department, doctorName, patientName, patientId: req.user._id, date, timeSlot
        });
        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
};

const getAppointments = async (req, res, next) => {
    try {
        let appointments;
        if (req.user.role === 'doctor') {
            // Doctors see ALL appointments regardless of assigned doctor name
            appointments = await Appointment.find({});
        } else {
            appointments = await Appointment.find({ patientId: req.user._id });
        }
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (req.user.role !== 'doctor') {
            res.status(403);
            throw new Error('Only doctors can update');
        }
        const appointment = await Appointment.findById(req.params.id);
        if (appointment) {
            appointment.status = status;
            const updated = await appointment.save();
            res.json(updated);
        } else {
            res.status(404);
            throw new Error('Appointment not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus };
