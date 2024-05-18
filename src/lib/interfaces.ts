// interfaces.ts
import {Bucket, Cluster, Collection, Scope} from "couchbase";

export interface ClusterConfig {
    cluster: Cluster;
    bucket: Bucket;
    scope: Scope;
    collection: Collection;
}

export interface ShortenUrlResult {
    message: string;
    shortUrl: string;
}

export interface UrlShortDoc {
    longUrl: string;
    shortUrl: string;
    createdAt?: string; // optional parameter
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