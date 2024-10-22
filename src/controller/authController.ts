import { Request, Response } from 'express';
import { IRedisService } from '../interface/IRedisService';
import { OAuth2Client } from 'google-auth-library';

export default class AuthController {
    private oauth2Client: OAuth2Client;
    private redisService: IRedisService;

    constructor(redisService: IRedisService, oauth2Client: any) {
        this.oauth2Client = oauth2Client;
        this.redisService = redisService;
    }

    getAuthUrl = (req: Request, res: Response) => {
        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar',
            ],
        });
        res.json({ url: url.concat('&prompt=consent') });
    };

    exchangeCodeForTokens = async (req: Request, res: Response) => {
        const { code } = req.query;

        try {
            if (typeof code !== 'string') {
                res.status(400).json({ error: 'Invalid code parameter' });
                return;
            }
            const { tokens } = await this.oauth2Client.getToken(code);

            if (!tokens.refresh_token) {
                res.status(400).json({ error: 'Refresh token not provided' });
                return
            }

            if (!tokens.access_token) {
                res.status(400).json({ error: 'Access token not provided' });
                return
            }

            this.redisService.set('refresh_token', tokens.refresh_token);
            this.redisService.setex('access_token', 3600, tokens.access_token);

            this.oauth2Client.setCredentials(tokens);

            res.json({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, client_id: process.env.GOOGLE_CLIENT_ID });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}
