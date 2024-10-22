export interface IRedisService {
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<number> ;
    exists(key: string): Promise<number>;
    setex(key: string, seconds: number, value: string): Promise<void>;
    hset(hash: string, key: string, value: string): Promise<void>;
    hget(hash: string, key: string): Promise<string | null>;
    hdel(hash: string, key: string): Promise<number>;
    hgetall(hash: string): Promise<Record<string, string>>;
    quit(): Promise<void>;
}