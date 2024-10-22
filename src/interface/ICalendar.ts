export interface IEventDetails {
    summary: string;
    description?: string;
    location?: string;
    start: {
        dateTime: string; 
        timeZone?: string; 
    };
    end: {
        dateTime: string; 
        timeZone?: string; 
    };
    attendees?: Array<{
        email: string; 
        optional?: boolean; 
        responseStatus: string; 
    }>;
    reminders?: {
        useDefault: boolean; 
        overrides?: Array<{
            method: string; 
            minutes: number;
        }>;
    };
    [key: string]: any; 
}
