// src/lib/couchbaseConnector.ts
import config from '../../config.ts';
import { connect, type Cluster, type Bucket, type Scope, type Collection } from 'couchbase';

interface ErrorHandler {
    handleError(error: Error): void;
}

class GeneralErrorHandler implements ErrorHandler {
    handleError(error: Error): void {
        // Handle general error here
    }
}

class TimeoutErrorHandler implements ErrorHandler {
    handleError(error: Error): void {
        // Handle timeout error here
    }
}

class ConnectionErrorHandler implements ErrorHandler {
    handleError(error: Error): void {
        // Handle connection error here
    }
}

// Define the interface for the connection details
export interface capellaConn {
    cluster: Cluster;
    bucket: Bucket;
    scope: Scope;
    collection: Collection;
    connect: typeof connect;
}

// Connection function using the defined interface
export async function clusterConn(): Promise<capellaConn> {
    console.log("Attempting to connect to Couchbase...");

    const errorHandlersByType: Record<string, ErrorHandler> = {
        general: new GeneralErrorHandler(),
        timeout: new TimeoutErrorHandler(),
        connection: new ConnectionErrorHandler(),
    };

    try {
        const clusterConnStr: string = config.couchbase.URL;
        const username: string = config.couchbase.USERNAME;
        const password: string = config.couchbase.PASSWORD;
        const bucketName: string = config.couchbase.BUCKET;
        const scopeName: string = config.couchbase.SCOPE;
        const collectionName: string = config.couchbase.COLLECTION;

        console.log(`Configuring connection with the following default connection details:
                    URL: ${clusterConnStr}, 
                    Username: ${username}, 
                    Bucket: ${bucketName}, 
                    Scope: ${scopeName}, 
                    Collection: ${collectionName}`);

        const cluster: Cluster = await connect(clusterConnStr, {
            username: username,
            password: password
        });

        console.log("Cluster connection established.");

        const bucket: Bucket = cluster.bucket(bucketName);
        console.log(`Bucket ${bucketName} accessed.`);

        const scope :Scope = bucket.scope(scopeName);
        const collection: Collection = scope.collection(collectionName);
        console.log(`Collection ${collectionName} accessed under scope ${scopeName}.`);

        return { cluster, bucket, scope, collection, connect };

    } catch (error: any) {
        const errorHandler = errorHandlersByType[error.name];

        if (errorHandler && error instanceof Error) {
            errorHandler.handleError(error);
        } else {
            // Handle or throw the error if there's no specific error handler
            console.error("Unexpected error:", error);
            throw error;
        }
    }
    // Return a default CapellaConn object or throw an error if the connection could not be established
    throw new Error('Could not establish a Couchbase connection');
}