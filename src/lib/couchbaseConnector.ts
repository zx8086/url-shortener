// src/lib/couchbaseConnector.ts
import type { Cluster, Bucket, Collection, connect } from 'couchbase';

// Define the interface for the connection details
export interface CouchbaseConnection {
    cluster: Cluster;
    bucket: Bucket;
    collection: Collection;
}

// Connection function using the defined interface
export async function connectToCouchbase(): Promise<CouchbaseConnection> {
    console.log("Attempting to connect to Couchbase...");

    try {
        // Read environment variables for connection (assumes use of a runtime like Node.js)
        const clusterConnStr: string = Bun.env.COUCHBASE_URL || 'couchbases://your-endpoint.couchbase.com';
        const username: string = Bun.env.COUCHBASE_USER || 'default_user';
        const password: string = Bun.env.COUCHBASE_PASSWORD || 'default_password';
        const bucketName: string = Bun.env.COUCHBASE_BUCKET || 'default_bucket';
        const scopeName: string = Bun.env.COUCHBASE_SCOPE || 'default_scope';
        const collectionName: string = Bun.env.COUCHBASE_COLLECTION || 'default_collection';

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

        return { cluster, bucket, collection };
    } catch (error) {
        console.error("Couchbase connection failed:", error);
        throw error; // Re-throw the error after logging
    }
}
