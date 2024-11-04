// src/lib/couchbaseConnector.ts
import config from '../config.ts';
import { connect, Cluster, Bucket, Scope, Collection } from 'couchbase';

interface ErrorHandler {
    handleError(error: Error): Promise<void>;
}

class GeneralErrorHandler implements ErrorHandler {
    handleError(error: Error): Promise<void> {
        console.error(`An error occurred: ${error.message}`);
        return Promise.resolve();
    }
}

let unambiguousTimeoutRetryCount = 0;

class UnambiguousTimeoutErrorHandler implements ErrorHandler {
    private maxRetries: number = 3;

    async handleError (error: Error): Promise<void> {
        unambiguousTimeoutRetryCount++;
        console.error('An unambiguous timeout error occurred:', error.message);

        if (unambiguousTimeoutRetryCount <= this.maxRetries) {
            console.log('Retrying... Attempt: ', unambiguousTimeoutRetryCount);
            await clusterConn();
        } else {
            console.error('Max retry attempts exceeded.');
        }
    }
}

class TimeoutErrorHandler implements ErrorHandler {
    private maxRetries: number = 3;
    private retryCount: number = 0;

    async handleError (error: Error): Promise<void> {
        this.retryCount++;
        console.error(`A timeout error occurred: ${error.message}`);

        if (this.retryCount <= this.maxRetries) {
            console.log('Retrying... Attempt: ', this.retryCount);
            await clusterConn();
        } else {
            console.error('Max retry attempts exceeded.');
        }
    }
}

class ConnectionErrorHandler implements ErrorHandler {
    private maxRetries: number = 3;
    private retryCount: number = 0;

    async handleError (error: Error): Promise<void> {
        this.retryCount++;
        console.error(`A connection error occurred: ${error.message}`);

        if (this.retryCount <= this.maxRetries) {
            console.log('Retrying... Attempt: ', this.retryCount);
            await clusterConn();
        } else {
            console.error('Max retry attempts exceeded.');
        }
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
        UnambiguousTimeoutError: new UnambiguousTimeoutErrorHandler(),
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
        console.error('Error name:', error.name);
        const errorName = error.name ? error.name : 'general';  // Don't convert to lowercase
        const errorHandler = errorHandlersByType[errorName];
        if (errorHandler && error instanceof Error) {
            await errorHandler.handleError(error);
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
    // Return a default CapellaConn object or throw an error if the connection could not be established
    throw new Error('Could not establish a Couchbase Capella connection');
}