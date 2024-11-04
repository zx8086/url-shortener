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
    createdAt?: string; 
}

export interface ErrorResponse {
    url?: string;
    shortUrl?: string;
    code?: number;
    longUrl?: string;
    message: string;
}

export interface CouchbaseError {
    code: number;
    message?: string; 
}

export interface RequestBody {
    longUrl: string;
}

export interface Options {
    parameters: string[];
}

export type FetchUrlResult = UrlShortDoc | ErrorResponse | undefined | null;
export type ShortenUrlResult = ShortenUrl | ErrorResponse | null;