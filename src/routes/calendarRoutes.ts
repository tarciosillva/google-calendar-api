import express from 'express';
import { calendarController } from "../app.module";

const router = express.Router();

router.post('/events', calendarController.createEvent);

router.put('/events/:eventId', calendarController.updateEvent);

router.delete('/events/:eventId', calendarController.cancelEvent);

router.post('/availability', calendarController.checkAvailability);

router.post('/refresh-token', calendarController.refreshToken);

export default router;
