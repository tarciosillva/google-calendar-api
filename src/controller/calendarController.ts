import { Request, Response } from 'express';
import { google } from 'googleapis';
import { IRedisService } from '../interface/IRedisService';
import { IEventDetails } from '../interface/ICalendar';
import { OAuth2Client } from 'google-auth-library';

const calendar = google.calendar('v3');

export default class CalendarController {
    private oauth2Client: OAuth2Client;
    private redisService: IRedisService;

    constructor(redisService: IRedisService, oauth2Client: any) {
        this.oauth2Client = oauth2Client;
        this.redisService = redisService;
    }

    refreshAccessToken = async (refreshToken: string): Promise<string> => {
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        return credentials.access_token as string;
    };

    ensureAccessToken = async (): Promise<string> => {
        const accessToken = await this.redisService.get('access_token');
        const refreshToken = await this.redisService.get('refresh_token');

        if (!accessToken) {
            if (!refreshToken) {
                throw new Error('Refresh token is missing');
            }
            return this.refreshAccessToken(refreshToken);
        }

        return accessToken;
    };

    createEvent = async (req: Request, res: Response) => {
        const eventDetails = req.body.eventDetails as IEventDetails;
        try {
            const accessToken = await this.ensureAccessToken();
            this.oauth2Client.setCredentials({ access_token: accessToken });

            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: eventDetails,
                auth: this.oauth2Client,
                sendUpdates: 'all',
            });

            res.json(response.data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    updateEvent = async (req: Request, res: Response) => {
        const eventDetails = req.body.eventDetails as IEventDetails;
        const eventId = req.params.eventId;

        try {
            const accessToken = await this.ensureAccessToken();
            this.oauth2Client.setCredentials({ access_token: accessToken });

            const response = await calendar.events.update({
                calendarId: 'primary',
                eventId,
                requestBody: eventDetails,
                auth: this.oauth2Client,
                sendUpdates: 'all',
            });

            res.json(response.data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    cancelEvent = async (req: Request, res: Response) => {
        const { eventId } = req.params;

        try {
            const accessToken = await this.ensureAccessToken();
            this.oauth2Client.setCredentials({ access_token: accessToken });

            await calendar.events.delete({
                auth: this.oauth2Client,
                calendarId: 'primary',
                eventId,
                sendUpdates: 'all',
            });

            res.json({ message: 'Evento cancelado com sucesso' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    checkAvailability = async (req: Request, res: Response) => {
        const { timeMin, timeMax, emails } = req.body;

        try {
            const accessToken = await this.ensureAccessToken();
            this.oauth2Client.setCredentials({ access_token: accessToken });

            const response = await calendar.freebusy.query({
                auth: this.oauth2Client,
                requestBody: {
                    timeMin,
                    timeMax,
                    timeZone: 'America/Sao_Paulo',
                    items: emails.map((email: string) => ({ id: email })),
                },
            });

            res.json(response.data.calendars);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    refreshToken = async (req: Request, res: Response) => {
        const refreshToken = await this.redisService.get('refresh_token'); 

        try {
            if (!refreshToken) {
                throw new Error('Refresh token is missing');
            }
            const newAccessToken = await this.refreshAccessToken(refreshToken);
            await this.redisService.setex('access_token', 3600, newAccessToken);
            res.json({ accessToken: newAccessToken });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
