// src/service.ts
import { getCluster } from './lib/clusterProvider.ts';

import config from '../config.ts';
import {MutationResult} from "couchbase";
import type { UrlShortDoc, CouchbaseError } from './lib/interfaces';
import { ulid } from 'ulid';

export async function shortenUrl(longUrl: string): Promise<{ message: string, shortUrl: string }> {
  const { cluster, bucket, scope, collection } = await getCluster();

  try {

    console.log("Checking if URL already exists in database...");

    const query = 'SELECT META().id as shortId, s.shortUrl FROM `default`.test.shortner AS s WHERE s.longUrl = $1 LIMIT 1;';
    const options = { parameters: [longUrl] };

    // Execute the query using the cluster
    const queryResult = await cluster.query(query, options);

    console.log(queryResult)

    if (queryResult.rows.length > 0) {

      console.log("URL already exists in database, returning existing short URL.");

      return {
        shortUrl: queryResult.rows[0].shortUrl,
        message: "URL already shortened"
      };
    }

    console.log("URL not found, creating new shortened URL...");

    const baseUrl : string = config.elysiaJs.BASE_URL;
    const port : string = config.elysiaJs.PORT;
    const shortId : string = ulid();
    const shortUrl : string = `${baseUrl}:${port}/${shortId}`;

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
    const { cluster, bucket, scope, collection } = await getCluster();

    console.log(`Fetching document for ID: ${urlUniqueId}`);

    let getUrl: { content: UrlShortDoc};
    getUrl = await collection.get(urlUniqueId);
    return getUrl.content;

  } catch (error) {
    if ((error as CouchbaseError).code === 13) { // Couchbase error code 13 corresponds to "document not found"

      console.log(`No document found for ID: ${urlUniqueId}`);

      return null;

    } else {

      console.error("Error fetching URL:", (error as CouchbaseError).message);

      throw error;
    }
  }
}