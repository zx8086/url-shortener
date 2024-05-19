// src/service.ts
import { getCluster } from './lib/clusterProvider.ts';
import config from '../config.ts';
import type { MutationResult, QueryResult} from "couchbase";
import type { UrlShortDoc, CouchbaseError, Options, ClusterConfig, ShortenUrlResult} from './lib/interfaces';
import  { n1qlCheckURLExist } from './../queries/n1qlQueries'
import { ulid } from 'ulid';

export async function shortenUrl(longUrl: string): Promise<ShortenUrlResult | null> {
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

    const newShortenerDoc: UrlShortDoc = {
      longUrl,
      shortUrl,
      createdAt: new Date().toISOString()
    };

    console.log(`Inserting new document with ID: ${shortId}`);

    let addNewShortenDoc: MutationResult;
    addNewShortenDoc = await collection.upsert(shortId, newShortenerDoc);

    console.log(`Couchbase Upsert Result:`,  addNewShortenDoc);
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
    const { collection }: ClusterConfig = await getCluster();

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