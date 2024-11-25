// src/index.ts

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";
import { compression } from "elysia-compression";
import { swagger } from "@elysiajs/swagger";
import { urlController } from "./controller.ts";
import config from "./config.ts";

function getExampleUrl(): string {
  const baseUrl = config.elysiaJs.BASE_URL;
  const port = config.elysiaJs.PORT;
  return baseUrl.includes("localhost") ? `${baseUrl}:${port}` : baseUrl;
}

const app = new Elysia()
  .use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    rateLimit({
      duration: 60000,
      max: 100,
      generator: (req) => {
        return (
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "anonymous"
        );
      },
    }),
  )
  .use(compression())
  .use(
    swagger({
      documentation: {
        info: {
          title: "BitLy URL Shortener API",
          version: "1.0.1",
          description: "API for shortening and managing Tiny URLs",
        },
        tags: [
          { name: "URLs", description: "URL shortening endpoints" },
          { name: "Health", description: "Health check endpoints" },
        ],
        servers: [
          {
            url: getExampleUrl(),
            description: "Main server",
          },
        ],
        paths: {
          "/tinyurl": {
            post: {
              tags: ["URLs"],
              summary: "Shorten a URL",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["longUrl"],
                      properties: {
                        longUrl: {
                          type: "string",
                          description: "The URL to be shortened",
                        },
                      },
                    },
                    example: {
                      longUrl: "https://svelte.dev/docs/kit/introduction",
                    },
                  },
                },
              },
              responses: {
                200: {
                  description: "URL shortened successfully",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/components/schemas/ShortenUrlResponse",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            ShortenUrlRequest: {
              type: "object",
              required: ["tinyurl"],
              properties: {
                tinyurl: {
                  type: "string",
                  description: "The Url to be shortened",
                  example: "https://svelte.dev/docs/kit/introduction",
                },
              },
            },
            ShortenUrlResponse: {
              type: "object",
              properties: {
                shortUrl: {
                  type: "string",
                  description: "The Tiny Url",
                  example: `${getExampleUrl()}01HQ5N8P8JK2X`,
                },
                message: {
                  type: "string",
                  description: "Response message",
                  example: "URL shortened successfully",
                },
              },
            },
          },
        },
      },
      path: "/swagger",
    }),
  );

app.onRequest(({ set }) => {
  set.headers["X-Frame-Options"] = "DENY";
  set.headers["X-Content-Type-Options"] = "nosniff";
  set.headers["X-XSS-Protection"] = "1; mode=block";
  set.headers["Strict-Transport-Security"] =
    "max-age=31536000; includeSubDomains";
  set.headers["Content-Security-Policy"] =
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https:;";
  set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  set.headers["Permissions-Policy"] =
    "camera=(), microphone=(), geolocation=()";
});

app
  .get("/", () => ({
    message: "Welcome to the BitLy URL Shortener API",
    description: "A simple and fast URL shortening service",
    documentation: "/swagger",
    // endpoints: {
    //   shorten: "/tinyurl",
    //   health: "/health",
    // },
    version: "1.0.1",
  }))
  .get("/favicon.ico", () => new Response(null, { status: 204 }))
  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }));

app.onError(({ code, error, set }) => {
  switch (code) {
    case "NOT_FOUND":
      set.status = 404;
      return { error: "Not Found" };
    case "VALIDATION":
      set.status = 400;
      return { error: error.message };
    default:
      set.status = 500;
      console.error(`[Error] ${error.message}`);
      return { error: "Internal Server Error" };
  }
});

app.onRequest(({ request }) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
});

urlController(app);

try {
  const port = parseInt(config.elysiaJs.PORT, 10);
  if (isNaN(port)) {
    throw new Error("Invalid port number");
  }

  app.listen(port, () => {
    console.log(`🦊 URL Shortener is running at  ${getExampleUrl()}`);
    console.log(
      `📚 Swagger documentation available at ${getExampleUrl()}/swagger`,
    );
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  app.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  app.stop();
  process.exit(0);
});

export type App = typeof app;
