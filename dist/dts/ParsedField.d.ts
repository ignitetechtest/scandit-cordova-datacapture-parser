export interface ParsedFieldJSON {
    name: string;
    parsed: any;
    rawString: string;
    issues?: string[];
}
export interface PrivateParsedField {
    fromJSON(json: ParsedFieldJSON): ParsedField;
}
export declare class ParsedField {
    private _name;
    get name(): string;
    private _parsed;
    get parsed(): any;
    private _rawString;
    get rawString(): string;
    private _issues;
    get issues(): string[];
    private static fromJSON;
}
