// src/shortener.service.ts
import { connectToCouchbase } from './lib/couchbaseConnector';
import { v4 as uuidv4 } from 'uuid';
import { UrlShortDoc } from './lib/interfaces';

export async function shortenUrl(longUrl: string, cluster: Cluster, collection: Collection): Promise<{ message: string, shortUrl: string }> {
  try {
    console.log("Starting the URL shortening process...");

    // Assuming 'test' is the scope and 'shortener' is the collection as per your query
    const bucket = cluster.bucket('default'); // Ensure this is the correct bucket name
    const scope = bucket.scope('test'); // Adjust the scope name as per your setup

    console.log("Checking if URL already exists in database...");
    console.log("Executing query...");

    const findUrlQuery = "SELECT s.longUrl, s.shortUrl FROM `shortener` AS s WHERE s.longUrl = $1 LIMIT 1;";
    const queryParams = { parameters: [longUrl] };

    // Execute the query on the specified scope
    const result = await scope.query(findUrlQuery, queryParams);

    console.log("Query executed, checking results...");
    if (result.rows.length > 0) {
      console.log("URL already exists in database.");
      return {
        message: "URL already shortened",
        shortUrl: result.rows[0].shortUrl
      };
    }

    console.log("URL not found, creating new shortened URL...");
    const baseUrl = process.env.BASE_URL || 'http://localhost';
    const port = process.env.PORT || '3005';
    const shortId = uuidv4().slice(0, 8);
    const shortUrl = `${baseUrl}:${port}/${shortId}`;

    const newShortenerDoc: UrlShortDoc = {
      longUrl,
      shortUrl,
      createdAt: new Date().toISOString()
    };

    console.log("Inserting new document...");
    await collection.upsert(shortId, newShortenerDoc);
    console.log("Document inserted successfully.");
    return {
      message: "URL shortened successfully",
      shortUrl
    };
  } catch (error) {
    console.error("Failed to shorten URL:", error);
    throw error;
  }
}

// Function to fetch a URL
export async function fetchUrl(urlUniqueId: string): Promise<UrlShortDoc | null> {
  try {
    const { collection } = await connectToCouchbase();
    console.log(`Fetching document for ID: ${urlUniqueId}`);

    const result = await collection.get(urlUniqueId);
    return result.content as UrlShortDoc;
  } catch (error) {
    // Check if the error is a document not found error
    if (error.code === 13) { // Couchbase error code 13 corresponds to "document not found"
      console.log(`No document found for ID: ${urlUniqueId}`);
      return null;
    } else {
      console.error("Error fetching URL:", error);
      throw error; // Propagate unexpected errors
    }
  }
}