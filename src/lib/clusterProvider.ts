// src/lib/clusterProvider.ts
import type { Cluster } from 'couchbase';
import { connectToCouchbase } from './couchbaseConnector.ts';
import type { CouchbaseConnection }  from './couchbaseConnector.ts';

let connection: CouchbaseConnection | null = null;

export const getCluster = async (): Promise<CouchbaseConnection> => {
    if (!connection) {
        connection = await connectToCouchbase();
    }
    return connection;
};