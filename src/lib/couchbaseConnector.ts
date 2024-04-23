import {
    Bucket,
    Cluster,
    Collection,
    connect,
    ConnectOptions,
} from 'couchbase'

// Connection function
export async function connectToCouchbase() {
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

        const connectOptions: ConnectOptions = {
            username: username,
            password: password,
            configProfile: 'wanDevelopment'
        };

        console.log("Connecting to cluster...");
        const cluster: Cluster = await connect(clusterConnStr, connectOptions);
        if (!cluster) {
            throw new Error("Failed to connect to cluster.");
        }
        console.log("Cluster connection established.");

        console.log(`Accessing bucket: ${bucketName}...`);
        const bucket: Bucket = cluster.bucket(bucketName);
        if (!bucket) {
            throw new Error(`Failed to access bucket: ${bucketName}`);
        }
        console.log(`Bucket ${bucketName} accessed.`);

        console.log(`Accessing scope '${scopeName}' and collection '${collectionName}'...`);
        const scope = bucket.scope(scopeName);
        if (!scope) {
            throw new Error(`Failed to access scope: ${scopeName}`);
        }
        const collection: Collection = scope.collection(collectionName);
        if (!collection) {
            throw new Error(`Failed to access collection: ${collectionName}`);
        }
        console.log(`Scope '${scopeName}' and Collection '${collectionName}' accessed.`);

        console.log("Connection to Couchbase established successfully.");

        return { cluster, bucket, collection };
    } catch (error) {
        console.error("Couchbase connection failed:", error);
        throw error; // Re-throw to propagate the error
    }
};
