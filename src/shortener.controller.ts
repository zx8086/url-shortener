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

  app.get("/favicon.ico", (context) => {
    context.status = 204; // No Content
    context.end(); // This ends the request with no content being sent
  });

  app.get("/:uniqueId", async (context) => {
    const uniqueId = context.params.uniqueId;
    const urlDoc = await fetchUrl(uniqueId);

    console.log("Fetching URL for unique ID:", urlDoc);

    if (urlDoc) {
      // Set the permanent redirect status code and perform the redirect
      context.set.status = 301;
      context.set.redirect = urlDoc.longUrl;  // Using the redirect property as per documentation
    } else {
      context.status = 404;
      context.body = { message: "Page not found" };  // Return error message in the response body
    }
  });



  // app.get("/:uniqueId", async (context) => {
  //   const uniqueId = context.params.uniqueId;
  //   const urlDoc = await fetchUrl(uniqueId);

  //   console.log("Fetching URL for unique ID:", urlDoc);

  //   if (urlDoc) {
  //     // Set the permanent redirect status code
  //     context.status = 301;

  //     // Assuming Elysia allows direct manipulation of the headers
  //     context.headers = {
  //       'Location': urlDoc.longUrl
  //     };

  //     // Since we're setting headers directly, ensure no body is sent
  //     context.body = "";  // Or consider using `context.end()` if that's supported to terminate the request
  //   } else {
  //     context.status = 404;
  //     context.body = { message: "Page not found" };  // Return error message in the response body
  //   }
  // });


};

// Setup routes using the urlController
urlController(app);

export default app;
