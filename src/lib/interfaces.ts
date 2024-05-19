// interfaces.ts
import {Bucket, Cluster, Collection, Scope} from "couchbase";

export interface ClusterConfig {
    cluster: Cluster;
    bucket: Bucket;
    scope: Scope;
    collection: Collection;
}

export interface ShortenUrl {
    message: string;
    shortUrl: string;
}

export interface UrlShortDoc {
    longUrl: string;
    shortUrl: string;
    createdAt?: string; // optional parameter
}

export interface ErrorResponse {
    url?: string; // The url is optional because it's not present in the second error case
    shortUrl?: string; // The shortUrl is only present in one of the error cases
    code?: number; // Some optional additional info
    message: string;
}

export interface CouchbaseError {
    code: number;
    message?: string; // optional parameter
}

export interface RequestBody {
    longUrl: string;
}

export interface CustomError {
    message?: string; // optional parameter
}

export interface Options {
    parameters: string[];
}


export type FetchUrlResult = UrlShortDoc | ErrorResponse | null;
export type OperationResult = ShortenUrl | ErrorResponse | null;
export type ShortenUrlResult = ShortenUrl | ErrorResponse | null;