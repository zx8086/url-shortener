// src/controller.ts
import Elysia from 'elysia';
import { shortenUrl, fetchUrl } from './service.ts';

// Define RequestBody and Error with shape your function expects
interface RequestBody {
  longUrl: string;
}
interface CustomError {
  message?: string;
}

const app = new Elysia();

export const urlController = (app: Elysia) => {
  app.post("/shorten",
      async (context) => {
        try {
          console.log("Attempting to shorten URL");
          const longUrl: string = (context.body as RequestBody).longUrl;
          console.log("URL valid, attempting to shorten:", longUrl);
          if (!longUrl) {
            context.set.status = 400;
            context.body = {message: "Invalid or no URL provided."};
            return;
          }
          const result = await shortenUrl(longUrl);
          context.set.status = 200;
          return result;
        } catch (error) {
          console.error("Error during URL shortening:", (error as CustomError).message);
          context.set.status = 500;
          context.body = {message: (error as CustomError).message || 'Failed to shorten URL'};
        }
      });
  app.get("/:shortUrl", async (context) => {
    const shortId = context.params.shortUrl;
    const urlDoc = await fetchUrl(shortId);
    console.log("Fetching URL for unique ID:", urlDoc);
    console.log('context', context)
    if (urlDoc) {
      context.set.status = 301;
      context.set.headers.Location = urlDoc.longUrl;
    } else {
      context.set.status = 404;
      context.body = { message: "Page not found" };
    }
  });
};

urlController(app);