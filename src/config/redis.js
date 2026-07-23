import { createClient } from "redis";

const buildRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return { url: process.env.REDIS_URL };
  }

  if (process.env.REDIS_HOST) {
    return {
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
        reconnectStrategy: (retries) => {
          if (retries >= 5) return false;
          return Math.min(retries * 200, 2000);
        },
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
    };
  }

  return null;
};

const redisConfig = buildRedisConfig();

let client = null;
let ready = false;
let loggedError = false;

if (redisConfig) {
  client = createClient(redisConfig);

  client.on("error", (err) => {
    ready = false;
    if (!loggedError) {
      loggedError = true;
      console.log("Redis error:", err.message, "- caching disabled");
    }
  });

  client.on("ready", () => {
    ready = true;
    loggedError = false;
    console.log("Redis connected");
  });

  client.connect().catch((err) => {
    console.log("Redis connect failed:", err.message);
  });
} else {
  console.log("REDIS_URL / REDIS_HOST not set - caching disabled");
}

export const cacheGet = async (key) => {
  if (!ready) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 60) => {
  if (!ready) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    // caching is best-effort, never block the request
  }
};

export const cacheDelPattern = async (pattern) => {
  if (!ready) return;
  try {
    for await (const key of client.scanIterator({ MATCH: pattern })) {
      await client.del(key);
    }
  } catch (error) {
    // caching is best-effort, never block the request
  }
};
