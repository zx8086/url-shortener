import { connectToCouchbase } from './couchbaseConnector.ts';
import type { CouchbaseConnection } from './couchbaseConnector.ts';

let connection: CouchbaseConnection | null = null;

export const getCluster = async (): Promise<CouchbaseConnection> => {
    try {
        if (!connection) {
            connection = await connectToCouchbase();
            console.log('Connection to Couchbase established successfully.');  // <-- add this line
        }
        return connection;
    } catch (error: any) {
        console.error("Error connecting to Couchbase:", error);
        throw error; // Propagate the error so that caller can handle it if they want
    }
};