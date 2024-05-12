// interfaces.ts

// UrlShortDoc interface is used for handling URL shortening documents
export interface UrlShortDoc {
    longUrl: string;
    shortUrl: string;
    createdAt?: string; // optional parameter
}

// CouchbaseError interface is for error handling with Couchbase
export interface CouchbaseError {
    code: number;
    message?: string;
}

// RequestBody interface is used for handling HTTP request body with a longUrl property
export interface RequestBody {
    longUrl: string;
}

// CustomError interface is used for creating standardised error objects
export interface CustomError {
    message?: string;
}
