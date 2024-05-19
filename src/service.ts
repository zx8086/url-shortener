// src/service.ts
import { getCluster } from './lib/clusterProvider.ts';
import config from '../config.ts';
import type { MutationResult, QueryResult} from "couchbase";
import type {
  UrlShortDoc,
  CouchbaseError,
  Options,
  ClusterConfig,
  ShortenUrlResult,
  FetchUrlResult
} from './lib/interfaces';
import  { n1qlCheckURLExist } from './../queries/n1qlQueries'
import { ulid } from 'ulid';

export async function shortenUrl(longUrl: string): Promise<ShortenUrlResult> {
  try {

    const { cluster, collection }: ClusterConfig = await getCluster();

    console.log("Checking if URL already exists in database...");
    const query: any = n1qlCheckURLExist;

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

    console.log("URL not found, creating new shortened URL...");

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
    console.error("Failed to shorten URL:", error.message);

    // Convert to a new error type that can be correctly handled in urlController
    throw { name: error.constructor.name, message: error.message };
  }
}

export async function fetchUrl(urlId: string): Promise<FetchUrlResult> {
  try {
    const { collection }: ClusterConfig = await getCluster();

    console.log(`Fetching document for ID: ${urlId}`);

    let getUrl: { content: UrlShortDoc};
    getUrl = await collection.get(urlId);
    return getUrl.content;

  } catch (error) {
    if ((error as CouchbaseError).code === 13) { // Couchbase error code 13 corresponds to "document not found"
      console.log(`No document found for ID: ${urlId}`);

      return null;
    } else {
      console.error("Error fetching URL:", (error as CouchbaseError).message);
      throw error;
    }
  }
}