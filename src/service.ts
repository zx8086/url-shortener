// src/service.ts
import { getCluster } from './lib/clusterProvider.ts';
import config from './config.ts';
import type { MutationResult, QueryResult} from "couchbase";
import type {
  UrlShortDoc,
  CouchbaseError,
  Options,
  ClusterConfig,
  ShortenUrlResult,
  FetchUrlResult
} from './lib/interfaces';
import  { n1qlCheckURLExist } from './queries/n1qlQueries.ts'
import { ulid } from 'ulid';

// Add this interface near your other interfaces
interface CustomError extends Error {
  code?: string | number;
}

export async function shortenUrl(longUrl: string): Promise<ShortenUrlResult> {
  try {

    const { cluster, collection }: ClusterConfig = await getCluster();

    console.log("Checking if URL already exists in database...");

    const query: string = n1qlCheckURLExist;
    const options: Options  = { parameters: [longUrl] };

    const queryResult: QueryResult = await cluster.query(query, options);

    console.log(JSON.stringify(queryResult, null, 2));

    if (queryResult.rows.length > 0) {

      console.log("URL already exists in database, returning existing short URL.");

      return {
        shortUrl: queryResult.rows[0].shortUrl,
        message: "URL already shortened"
      };
    }

    console.log("URL not found, creating new short URL...");

    const baseUrl : string = config.elysiaJs.BASE_URL;
    const port : string = config.elysiaJs.PORT;
    const shortId : string = ulid();
    const shortUrl : string = `${baseUrl}:${port}/${shortId}`;

    const newUrlDoc: UrlShortDoc = {
      longUrl,
      shortUrl,
      createdAt: new Date().toISOString()
    };

    console.log(`Inserting new document with ID: ${shortId}`);

    let addNewUrlDoc: MutationResult;
    addNewUrlDoc = await collection.upsert(shortId, newUrlDoc);

    console.log(`Couchbase Upsert Result:`, addNewUrlDoc);
    console.log("Document inserted successfully.");
    console.log("URL shortened successfully")

    return {
      "shortUrl": shortUrl,
      "message": "URL shortened successfully"
    };

  } catch (error: any) {
    console.error("Failed to shorten URL:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Preserve the original error properties
    const enhancedError = new Error(error.message) as CustomError;
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;
    if (error.code) enhancedError.code = error.code;

    throw enhancedError;
  }
}

export async function fetchUrl(urlId: string): Promise<FetchUrlResult> {
  try {
    const { collection }: ClusterConfig = await getCluster();

    console.log(`Fetching document for ID: ${urlId}`);

    let getUrl: { content: UrlShortDoc};
    getUrl = await collection.get(urlId);
    return getUrl.content;

  } catch (error: any) {
    console.error("Error fetching URL:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Preserve the original error properties
    const enhancedError = new Error(error.message) as CustomError;
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;
    if (error.code) enhancedError.code = error.code;

    throw enhancedError;
  }
}