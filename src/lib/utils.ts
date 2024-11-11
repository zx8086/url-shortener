// src/lib/utils.ts

export function isURLValid(url: string): boolean {
  const urlPattern: RegExp =
    /^(https?:\/\/)?(?:[a-zA-Z0-9]-?)*[a-zA-Z0-9]+(?:\.(?:[a-zA-Z0-9]-?)*[a-zA-Z0-9]+)*(?::\d{1,5})?(?:\/[^\s]*)?$/;
  try {
    new URL(url);
    return urlPattern.test(url);
  } catch (_) {
    return false;
  }
}
