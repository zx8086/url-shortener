// src/lib/couchbaseConnector.ts
import { connect } from 'couchbase';  // Regular import for the function used at runtime
import type { Cluster, Bucket, Collection } from 'couchbase';  // Type-only imports

// Define the interface for the connection details
export interface CouchbaseConnection {
    cluster: Cluster;
    bucket: Bucket;
    collection: Collection;
    connect: typeof connect;
}

// Connection function using the defined interface
export async function connectToCouchbase(): Promise<CouchbaseConnection> {
    console.log("Attempting to connect to Couchbase...");

    try {
        const clusterConnStr: string = <string>Bun.env.COUCHBASE_URL;
        const username: string = <string>Bun.env.COUCHBASE_USERNAME;
        const password: string = <string>Bun.env.COUCHBASE_PASSWORD;
        const bucketName: string = <string>Bun.env.COUCHBASE_BUCKET;
        const scopeName: string = <string>Bun.env.COUCHBASE_SCOPE;
        const collectionName: string = <string>Bun.env.COUCHBASE_COLLECTION;

        console.log(`Configuring connection with the following details:
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

        const scope = bucket.scope(scopeName);
        const collection: Collection = scope.collection(collectionName);
        console.log(`Collection ${collectionName} accessed under scope ${scopeName}.`);

        return { cluster, bucket, collection, connect };
    } catch (error) {
        console.error("Couchbase connection failed:", error);
        throw error; // Re-throw the error after logging
    }
}
