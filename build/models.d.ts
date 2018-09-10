export declare type EventType = 'human' | 'battle';
export declare class WdDate {
    dateString: string;
    granularity: string;
    timestamp: number;
}
export declare class WdEntity {
    label: string;
    description: string;
    id: string;
    constructor(entity: any);
    private getProp;
}
export declare class WdLocation {
    coordinates: string;
    date?: number;
    description: string;
    end_date?: number;
    id?: string;
    label: string;
    wikidata_identifier: string;
}
export declare class Ev3nt {
    date: number;
    date_min: number;
    date_granulirity: string;
    date_min_granularity: string;
    description: string;
    end_date: number;
    end_date_max: number;
    end_date_granularity: string;
    end_date_max_granularity: string;
    id: string;
    label: string;
    tags?: string[];
    wikidata_identifier: string;
}
