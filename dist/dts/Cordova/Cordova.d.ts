export declare const Cordova: {
    pluginName: string;
    exec: (success: Function | null, error: Function | null, functionName: string, args: [
        any
    ] | null) => void;
};
export declare function initializeCordovaParser(): void;
export declare enum CordovaFunction {
    ParseString = "parseString",
    ParseRawData = "parseRawData",
    CreateUpdateNativeInstance = "createUpdateNativeInstance",
    DisposeParser = "disposeParser"
}
