import Elysia from 'elysia';
import { shortenUrl, fetchUrl } from './service.ts';
import { isURLValid } from './lib/utils';
import type { ShortenUrlResult, RequestBody, CustomError, OperationResult } from './lib/interfaces';

const app = new Elysia();

export const urlController = (app: Elysia) => {
  app.post("/shorten",
      async (context) : Promise<OperationResult> => {
        try {
          const longUrl: string = (context.body as RequestBody).longUrl;

          console.log("Received URL: ", longUrl);

          // check if longUrl is provided and valid
          if (!longUrl || !isURLValid(longUrl)) {
            context.set.status = 400;
            return {url: longUrl, message: "Invalid or no URL provided."};
          }

          console.log("URL valid, attempting to shorten:", longUrl);

          let result: ShortenUrlResult | null;
          result = await shortenUrl(longUrl);

          context.set.status = 200;
          return result;

        } catch (error) {

          console.error("Error during URL shortening:", (error as CustomError).message);

          context.set.status = 500;
          return {shortUrl: "", message: (error as CustomError).message || 'Failed to shorten URL'};
        }
      });

  app.get("/:shortUrl",
      async (context) : Promise<any> => {

    const shortId : string = context.params.shortUrl;
    const urlDoc : any = await fetchUrl(shortId);

    console.log("Fetching URL for unique ID:", urlDoc);
    console.log('context', context)

    if (urlDoc) {
      context.set.status = 301;
      context.set.headers.Location = urlDoc.longUrl;
    } else {
      context.set.status = 404;
      return { message: "Page not found" };
    }
  });
};

urlController(app);