import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import * as appointmentService from '../services/appointment.service';

export const getRecommendedDoctors = asyncHandler(async (req: Request, res: Response) => {
    const { diseaseId, limit } = req.validatedQuery as { diseaseId: string; limit: number };

    // Public endpoint — but if the requester happens to be a logged-in
    // patient (optionalAuthenticate populated req.user), resolve their
    // Patient id so the recommendation engine can apply the "seen this
    // doctor before" boost. Anonymous visitors just get the unboosted list.
    let patientId: string | undefined;
    if (req.user?.role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id },
            select: { id: true },
        });
        patientId = patient?.id;
    }

    const result = await appointmentService.getRecommendedDoctors(diseaseId, patientId, limit);
    sendSuccess(res, 200, 'Recommended doctors fetched', result);
});

export const getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.validatedQuery as { date: string };
    const slots = await appointmentService.getAvailableSlots(req.params.doctorId, date);
    sendSuccess(res, 200, 'Available slots fetched', slots);
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.createAppointment(req.patientId!, req.body);
    sendSuccess(res, 201, 'Appointment booked — awaiting doctor confirmation', appointment);
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.getAppointmentById(
        req.params.id,
        req.user!.id,
        req.user!.role
    );
    sendSuccess(res, 200, 'Appointment fetched', appointment);
});
