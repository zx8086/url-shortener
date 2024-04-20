//utils.ts
export function isURLValid(url: string): boolean {
    const urlPattern: RegExp = /^(http|https):\/\/[^ "]+$/;
  
    return urlPattern.test(url);
  }