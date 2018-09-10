interface Props {
    from?: string[];
    limit?: number;
    where?: string;
}
export declare const selectEventsSql: (props: Props) => string;
export {};
