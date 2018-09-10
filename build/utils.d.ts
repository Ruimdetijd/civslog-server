export declare const logError: (title: string, lines: string[]) => void;
export declare const logWarning: (title: any, lines: any) => void;
export declare const logMessage: (message: any) => void;
export declare const execFetch: (url: string, options?: {}) => Promise<any>;
export declare function fetchFromWikidata(urlPath: string, options?: any): Promise<any>;
export declare function fetchFromWikimedia(urlPath: string, options?: any): Promise<any>;
export declare const setUTCDate: (year: number, month?: number, day?: number, hour?: number, minutes?: number, seconds?: number, milliseconds?: number) => number;
export declare const promiseAll: (promises: Promise<any>[]) => Promise<any>;
