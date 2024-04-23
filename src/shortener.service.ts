// src/shortener.service.ts
import { connectToCouchbase } from './lib/couchbaseConnector';
import { v4 as uuidv4 } from 'uuid';
import { UrlShortDoc } from './lib/interfaces';

// Ensuring that bucket and collection are retrieved properly from the Couchbase connection
// This function now accepts a CouchbaseConnection object which contains both cluster and collection
export async function shortenUrl(longUrl: string, conn: connectToCouchbase): Promise<{ message: string, shortUrl: string }> {
  try {
    console.log("Checking if URL already exists in database...");
    const query = 'SELECT s.shortUrl FROM `default`._default.shortner AS s WHERE s.longUrl = $1 LIMIT 1;';
    const options = { parameters: [longUrl] };

    // Execute the query using the prepared statement or direct query
    const queryResult = await conn.bucket.scope('_default').query(query, options);

    if (queryResult.rows.length > 0) {
      console.log("URL already exists in database, returning existing short URL.");
      return {
        message: "URL already shortened",
        shortUrl: queryResult.rows[0].shortUrl
      };
    }

    console.log("URL not found, creating new shortened URL...");
    const baseUrl = process.env.BASE_URL || 'http://localhost';
    const port = process.env.PORT || '3005';
    const shortId = uuidv4().slice(0, 8);  // Generating a short ID
    const shortUrl = `${baseUrl}:${port}/${shortId}`;

    const newShortenerDoc: UrlShortDoc = {
      longUrl,
      shortUrl,
      createdAt: new Date().toISOString()
    };

    console.log(`Inserting new document with ID: ${shortId}`);
    await conn.collection.insert(shortId, newShortenerDoc);
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