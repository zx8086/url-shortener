// src/lib/couchbaseConnector.ts

import { Cluster, Collection, connect, Bucket } from 'couchbase';

// Define an interface for easier management of return types
interface CouchbaseConnection {
    cluster: Cluster;
    bucket: Bucket;
    collection: Collection;
}

// Connection function using the interface
export async function connectToCouchbase(): Promise<CouchbaseConnection> {
    console.log("Attempting to connect to Couchbase...");

    try {
        console.log("Reading environment variables for connection...");
        const clusterConnStr: string = Bun.env.COUCHBASE_URL;
        const username: string = Bun.env.COUCHBASE_USER;
        const password: string = Bun.env.COUCHBASE_PASSWORD;
        const bucketName: string = Bun.env.COUCHBASE_BUCKET;
        const scopeName: string = Bun.env.COUCHBASE_SCOPE;
        const collectionName: string = Bun.env.COUCHBASE_COLLECTION;

        console.log(`Configuring connection with the following details:
                    URL: ${clusterConnStr}, 
                    Username: ${username}, 
                    Bucket: ${bucketName}, 
                    Scope: ${scopeName}, 
                    Collection: ${collectionName}`);

        const cluster: Cluster = await connect(clusterConnStr, {
            username: username,
            password: password,
        });
        console.log("Cluster connection established.");

        const bucket: Bucket = cluster.bucket(bucketName);
        console.log(`Bucket ${bucketName} accessed.`);

        const scope = bucket.scope(scopeName);
        const collection: Collection = scope.collection(collectionName);
        console.log(`Collection ${collectionName} accessed under scope ${scopeName}.`);

        console.log("Connection to Couchbase established successfully.");

        return { cluster, bucket, collection };
    } catch (error) {
        console.error("Couchbase connection failed:", error);
        throw error; // Ensures that errors are not silently caught
    }
}
