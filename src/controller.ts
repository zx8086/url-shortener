import Elysia from 'elysia';
import { shortenUrl, fetchUrl } from './service.ts';
import { isURLValid } from './lib/utils';
import type { ShortenUrlResult, RequestBody, FetchUrlResult } from './lib/interfaces';

export const urlController = (app: Elysia): void => {
  app.post("/shorten", async (context) => {
    try {
      const longUrl: string = (context.body as RequestBody).longUrl;

      console.log("Received URL: ", longUrl);

      if (!longUrl || !isURLValid(longUrl)) {
        context.set.status = 400;
        console.log(`Url is invalid: ${longUrl}`);
        return { url: longUrl, message: "Invalid or no URL provided." };
      }

      console.log("URL valid, attempting to shorten:", longUrl);
      const result = await shortenUrl(longUrl);

      context.set.status = 200;
      return result;

    } catch (error: any) {
      let message = error.message || 'Failed to shorten URL';
      let status: number = 500;

      if (error.name === 'DocumentNotFoundError') {
        status = 404;
      } else {
        console.error('Error during URL shortening:', message);
      }

      context.set.status = status;
      return { message };
    }
  });

  app.get("/:shortUrl", async (context) => {
    try {
      const shortId: string = context.params.shortUrl;
      const urlDoc: any = await fetchUrl(shortId);

      console.log("Fetching URL for unique ID:", urlDoc);

      if (urlDoc) {
        context.set.status = 301;
        context.set.headers.Location = urlDoc.longUrl;
        return;
      } else {
        context.set.status = 404;
        return { message: "Page not found" };
      }
    } catch (error: any) {
      let message = error.message || 'Failed to fetch URL';
      let status: number = 500;

      if (error.name === 'DocumentNotFoundError') {
        status = 404;
        message = "Page not found";
      } else {
        console.error('Error during URL fetching:', message);
      }

      context.set.status = status;
      return { message };
    }
  });
};