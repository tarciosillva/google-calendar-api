import Redis from "ioredis";

class RedisService {
  private client: Redis;
  private connectionPromise: Promise<void>;

  /**
   * Initializes the connection to Redis and sets up connection and error events.
   * @param host - The Redis server address (default: 'localhost').
   * @param port - The Redis server port (default: 6379).
   */
  constructor(host: string = "localhost", port: number = 6379) {
    this.client = new Redis({ host, port, autoResubscribe: false });

    this.connectionPromise = new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Successfully connected to Redis.");
        resolve();
      });

      this.client.on("error", (err) => {
        console.error("Error connecting to Redis:", err);
        reject(err);
      });
    });
  }

  /**
   * Waits for the connection to Redis to be established.
   * @returns A Promise that resolves when the connection is established.
   */
  async waitForConnection(): Promise<void> {
    await this.connectionPromise;
  }

  /**
   * Sets a value for a key in Redis.
   * @param key - The key where the value will be stored.
   * @param value - The value to be stored.
   */
  async set(key: string, value: string): Promise<void> {
    await this.waitForConnection();
    await this.client.set(key, value);
  }

  /**
   * Gets the value associated with a key in Redis.
   * @param key - The key whose value will be retrieved.
   * @returns The value associated with the key, or null if the key does not exist.
   */
  async get(key: string): Promise<string | null> {
    await this.waitForConnection();
    return await this.client.get(key);
  }

  /**
   * Deletes a key from Redis.
   * @param key - The key to be deleted.
   * @returns The number of keys removed (1 if the key was removed, 0 if it did not exist).
   */
  async del(key: string): Promise<number> {
    await this.waitForConnection();
    return await this.client.del(key);
  }

  /**
   * Checks if a key exists in Redis.
   * @param key - The key to be checked.
   * @returns 1 if the key exists, 0 otherwise.
   */
  async exists(key: string): Promise<number> {
    await this.waitForConnection();
    return await this.client.exists(key);
  }

  /**
   * Sets a value for a key with an expiration time in Redis.
   * @param key - The key where the value will be stored.
   * @param seconds - The expiration time in seconds.
   * @param value - The value to be stored.
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.waitForConnection();
    await this.client.setex(key, seconds, value);
  }

  /**
   * Sets a value in a hash in Redis.
   * @param hash - The name of the hash.
   * @param key - The key within the hash.
   * @param value - The value to be stored in the hash.
   */
  async hset(hash: string, key: string, value: string): Promise<void> {
    await this.waitForConnection();
    await this.client.hset(hash, key, value);
  }

  /**
   * Gets the value of a key within a hash in Redis.
   * @param hash - The name of the hash.
   * @param key - The key within the hash.
   * @returns The value associated with the key within the hash, or null if the key does not exist.
   */
  async hget(hash: string, key: string): Promise<string | null> {
    await this.waitForConnection();
    return await this.client.hget(hash, key);
  }

  /**
   * Deletes a key within a hash in Redis.
   * @param hash - The name of the hash.
   * @param key - The key to be deleted within the hash.
   * @returns The number of fields removed (1 if the field was removed, 0 if it did not exist).
   */
  async hdel(hash: string, key: string): Promise<number> {
    await this.waitForConnection();
    return await this.client.hdel(hash, key);
  }

  /**
   * Gets all fields and values of a hash in Redis.
   * @param hash - The name of the hash.
   * @returns An object containing all fields and values of the hash.
   */
  async hgetall(hash: string): Promise<Record<string, string>> {
    await this.waitForConnection();
    return await this.client.hgetall(hash);
  }

  /**
   * Closes the connection to Redis.
   */
  async quit(): Promise<void> {
    await this.client.quit();
  }
}

export default RedisService;