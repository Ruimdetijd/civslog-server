interface Props {
    from?: string[];
    limit?: number;
    locations?: boolean;
    where?: string;
}
export declare const selectEventsSql: (props: Props) => string;
export {};
