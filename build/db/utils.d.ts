import { QueryResult } from 'pg';
export declare function hasRows(result: QueryResult): number;
export declare const byMissing: (where: any) => (req: any, res: any) => Promise<void>;
export declare const selectOne: (table: any, field: any, value: any) => Promise<any>;
export declare const execSql: (sql: string, values?: (string | number)[]) => Promise<QueryResult>;
