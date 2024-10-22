import { google } from "googleapis";
import AuthController from "./controller/authController";
import CalendarController from "./controller/calendarController";
import RedisUtil from './service/redisService';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;

if (!redisHost) {
  throw new Error('The environment variable REDIS_HOST must be defined.');
}

if (!redisPort) {
  throw new Error('The environment variable REDIS_PORT must be defined.');
}

const redis = new RedisUtil(redisHost, redisPort);

(async () => {
  await redis.waitForConnection();
})();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const authController = new AuthController(redis, oauth2Client);
const calendarController = new CalendarController(redis, oauth2Client);

export { authController, calendarController };