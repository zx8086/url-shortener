// src/shortener.controller.ts
import Elysia, { RequestContext } from 'elysia';
import { shortenUrl, fetchUrl } from './shortener.service';
import { connectToCouchbase } from './lib/couchbaseConnector';


const app = new Elysia();

export const urlController = (app: Elysia) => {
  app.post("/shorten", async (context: RequestContext) => {
    try {
      console.log("Attempting to shorten URL");
      const longUrl = context.body.longUrl;
      // if (!longUrl || !isValidUrl(longUrl)) {
      //   context.status = 400;
      //   context.body = { message: "Invalid or no URL provided." };
      //   return;
      // }

      console.log("Connecting to Couchbase");
      const { cluster, collection } = await connectToCouchbase();
      console.log("URL valid, attempting to shorten:", longUrl);
      const result = await shortenUrl(longUrl, cluster, collection);
      context.status = 200;
      context.body = result;
    } catch (error) {
      console.error("Error during URL shortening:", error);
      context.status = 500;
      context.body = { message: error.message || 'Failed to shorten URL' };
    }
  });

  app.get("/:shortUrl", async (context) => {
    const shortId = context.params.shortUrl;
    const urlDoc = await fetchUrl(shortId);

    console.log("Fetching URL for unique ID:", urlDoc);
    console.log('context', context)

    if (urlDoc) {
      // Set the permanent redirect status code and perform the redirect
      context.set.status = 301;
      context.set.redirect = urlDoc.longUrl;  // Using the redirect property as per documentation
      context.end();  // End the request after the redirect
    } else {
      context.set.status = 404;
      context.body = { message: "Page not found" };  // Return error message in the response body
    }
  });
};

// Setup routes using the urlController
urlController(app);

export default app;
