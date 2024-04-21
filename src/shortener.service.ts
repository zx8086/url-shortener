// Import required modules
import { cluster, Bucket, Collection } from 'couchbase';
import url from 'url';  // A standard library for URL parsing
import { v4 as uuidv4 } from 'uuid'; // For more robust unique IDs

// Establish connection to Couchbase cluster
const cluster = new Cluster(Bun.env.COUCHBASE_URL, {
  username: Bun.env.COUCHBASE_USER,
  password: Bun.env.COUCHBASE_PASSWORD
});
const bucket: Bucket = cluster.bucket('default');
const scope = bucket.scope('test');
const collection: Collection = scope.collection('shortner');

function sanitizeInput(input) {
  const allowedCharacters = /^[a-zA-Z0-9\-_\.]+$/; // Regular expression 
  return input.replace(/[^a-zA-Z0-9\-_\.]/g, ''); // Replace unsafe characters
}

// Enhance URL Validation
function isURLValid(longUrl) {
  try {
    new url.URL(longUrl);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to shorten a URL
export async function shortenUrl(submittedLongUrl: string) {
  try {
    // Sanitize the long URL
    const longUrl = sanitizeInput(submittedLongUrl);

    // Validate the URL
    const isValidUrl = isURLValid(longUrl);
    if (!isValidUrl) throw new Error("Invalid URL. Please enter a valid URL and try again");

    // Check if URL already exists
    const existingDoc = await collection.get(longUrl).catch(() => null);
    if (existingDoc) return existingDoc.content.shortUrl;

    const baseUrl = process.env.BASE_URL;
    const port = process.env.PORT;
    const shortId = uuidv4().slice(0, 8);
    const shortUrl = `${baseUrl}:${port}/${shortId}`;

    // Insert new URL document into Couchbase
    await collection.upsert(shortId, {
      longUrl,
      shortUrl,
      shortId
    });

    return {
      message: "URL shortened successfully",
      shortUrl
    };
  } catch (error) {
    throw error;
  }
}

// Function to fetch a URL
export async function fetchUrl(urlUniqueId: string) {
  try {
    const result = await collection.get(urlUniqueId);
    return result.content;
  } catch (error) {
    throw error;
  }
}
