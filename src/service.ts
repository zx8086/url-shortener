// src/service.ts
import { connectToCouchbase } from './lib/couchbaseConnector';
import { ulid } from 'ulid';
import type { UrlShortDoc, CouchbaseError } from './lib/interfaces';
import {MutationResult} from "couchbase";

export async function shortenUrl(longUrl: string): Promise<{ message: string, shortUrl: string }> {
  const { cluster, collection } = await connectToCouchbase();

  try {
    console.log("Checking if URL already exists in database...");
    const query = 'SELECT META().id as id, s.shortUrl FROM `default`.test.shortner AS s WHERE s.longUrl = $1 LIMIT 1;';
    const options = { parameters: [longUrl] };

    // Execute the query using the cluster
    const queryResult = await cluster.query(query, options);

    if (queryResult.rows.length > 0) {
      console.log("URL already exists in database, returning existing short URL.");
      return {
        shortUrl: queryResult.rows[0].shortUrl,
        message: "URL already shortened"
      };
    }

    console.log("URL not found, creating new shortened URL...");
    const baseUrl = process.env.BASE_URL || 'http://localhost';
    const port = process.env.PORT || '3005';
    const shortId = ulid();
    const shortUrl = `${baseUrl}:${port}/${shortId}`;

    const newShortenerDoc: UrlShortDoc = {
      longUrl,
      shortUrl,
      createdAt: new Date().toISOString()
    };

    console.log(`Inserting new document with ID: ${shortId}`);
    let cbUpsert: MutationResult;
    cbUpsert = await collection.upsert(shortId, newShortenerDoc);
    console.log(`Couchbase Upsert Result:`, cbUpsert);
    console.log("Document inserted successfully.");
    console.log("URL shortened successfully")

    return {
      "shortUrl": shortUrl,
      "message": "URL shortened successfully"
    };

  } catch (error) {
    console.error("Failed to shorten URL:", (error as CouchbaseError).message);
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
    if ((error as CouchbaseError).code === 13) { // Couchbase error code 13 corresponds to "document not found"
      console.log(`No document found for ID: ${urlUniqueId}`);
      return null;
    } else {
      console.error("Error fetching URL:", (error as CouchbaseError).message);
      throw error; // Propagate unexpected errors
    }
  }
}