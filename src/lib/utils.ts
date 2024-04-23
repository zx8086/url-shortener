//utils.ts
// This module contains utility functions that can be used across the application.
// It exports functions that sanitize and validate URLs.
// The sanitizeInput function removes unsafe characters from the input URL.
// The isURLValid function checks if the input URL is valid.

// Enhance URL Validation
import url from 'node:url';  // Standard library for URL parsing

export function sanitizeInput(longUrl: string)  {
  const allowedCharacters = /^[a-zA-Z0-9\-_\.]+$/; // Regular expression 
  return longUrl.replace(/[^a-zA-Z0-9\-_\.]/g, ''); // Replace unsafe characters
}

export function isURLValid(longUrl: string) {
  try {
    new url.URL(longUrl);  // This throws an error if the URL is invalid
    return true;
  } catch (error) {
    return false;  // Invalid URL
  }
}

