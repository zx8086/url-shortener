// src/queries/n1qlQueries.ts

export const n1qlCheckURLExist: string = `
SELECT META().id AS shortId, s.shortUrl FROM \`default\`.test.shortner AS s WHERE s.longUrl = $1 LIMIT 1;
`;
