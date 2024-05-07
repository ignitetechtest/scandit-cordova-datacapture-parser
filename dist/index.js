var scanditCordovaDatacaptureCore = require('scandit-cordova-datacapture-core.Core');
var scanditDatacaptureFrameworksCore = require('scandit-cordova-datacapture-core.Core');

// tslint:disable-next-line:variable-name
const Cordova = {
    pluginName: 'ScanditParser',
    exec: (success, error, functionName, args) => scanditCordovaDatacaptureCore.cordovaExec(success, error, Cordova.pluginName, functionName, args),
};
function getDefaults() {
    return new Promise((resolve, reject) => {
        Cordova.exec(resolve, reject, 'getDefaults', null);
    });
}
function initializeCordovaParser() {
    scanditCordovaDatacaptureCore.initializePlugin(Cordova.pluginName, getDefaults);
}
var CordovaFunction;
(function (CordovaFunction) {
    CordovaFunction["ParseString"] = "parseString";
    CordovaFunction["ParseRawData"] = "parseRawData";
    CordovaFunction["CreateUpdateNativeInstance"] = "createUpdateNativeInstance";
    CordovaFunction["DisposeParser"] = "disposeParser";
})(CordovaFunction || (CordovaFunction = {}));

class ParsedField {
    get name() {
        return this._name;
    }
    get parsed() {
        return this._parsed;
    }
    get rawString() {
        return this._rawString;
    }
    get issues() {
        return this._issues;
    }
    static fromJSON(json) {
        const field = new ParsedField();
        field._name = json.name;
        field._parsed = json.parsed;
        field._rawString = json.rawString;
        field._issues = json.issues || [];
        return field;
    }
}

class ParsedData {
    get jsonString() {
        return this._jsonString;
    }
    get fields() {
        return this._fields;
    }
    get fieldsByName() {
        return this._fieldsByName;
    }
    static fromJSON(json) {
        const data = new ParsedData();
        data._jsonString = JSON.stringify(json);
        data._fields = json.map(ParsedField.fromJSON);
        data._fieldsByName = data._fields.reduce((fieldsByName, field) => {
            fieldsByName[field.name] = field;
            return fieldsByName;
        }, {});
        return data;
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class ParserProxy {
    static forParser(parser) {
        const proxy = new ParserProxy();
        proxy.parser = parser;
        return proxy;
    }
    parseString(data) {
        return new Promise((resolve, reject) => this.parser.waitForInitialization().then(() => ParserProxy.cordovaExec((parsedData) => resolve(ParsedData.fromJSON(JSON.parse(parsedData))), reject, CordovaFunction.ParseString, [{
                id: this.parser.id,
                data,
            }])));
    }
    parseRawData(data) {
        return new Promise((resolve, reject) => this.parser.waitForInitialization().then(() => ParserProxy.cordovaExec((parsedData) => resolve(ParsedData.fromJSON(JSON.parse(parsedData))), reject, CordovaFunction.ParseRawData, [{
                id: this.parser.id,
                data,
            }])));
    }
    createUpdateNativeInstance() {
        return new Promise((resolve, reject) => ParserProxy.cordovaExec(resolve, reject, CordovaFunction.CreateUpdateNativeInstance, [JSON.stringify(this.parser.toJSON())]));
    }
    disposeParser() {
        return new Promise((resolve, reject) => ParserProxy.cordovaExec(resolve, reject, CordovaFunction.DisposeParser, [this.parser.id]));
    }
}
ParserProxy.cordovaExec = Cordova.exec;

class Parser extends scanditDatacaptureFrameworksCore.DefaultSerializeable {
    get id() {
        return this._id;
    }
    get proxy() {
        if (!this._proxy) {
            this._proxy = ParserProxy.forParser(this);
        }
        return this._proxy;
    }
    static forContextAndFormat(context, dataFormat) {
        const parser = new Parser();
        parser.dataFormat = dataFormat;
        parser._context = context;
        return parser.proxy.createUpdateNativeInstance()
            .then(() => {
            parser.isInitialized = true;
            parser.waitingForInitialization.forEach(f => f());
            return parser;
        });
    }
    constructor() {
        super();
        this.type = 'parser';
        this.options = {};
        this._id = `${Date.now()}`;
        this.isInitialized = false;
        this.waitingForInitialization = [];
    }
    setOptions(options) {
        this.options = options;
        return this.proxy.createUpdateNativeInstance();
    }
    parseString(data) {
        return this.proxy.parseString(data);
    }
    parseRawData(data) {
        return this.proxy.parseRawData(data);
    }
    dispose() {
        this.proxy.disposeParser();
    }
    waitForInitialization() {
        if (this.isInitialized) {
            return Promise.resolve();
        }
        else {
            return new Promise(resolve => this.waitingForInitialization.push(resolve));
        }
    }
}
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('id')
], Parser.prototype, "_id", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], Parser.prototype, "_context", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], Parser.prototype, "isInitialized", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], Parser.prototype, "waitingForInitialization", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], Parser.prototype, "_proxy", void 0);

exports.ParserDataFormat = void 0;
(function (ParserDataFormat) {
    ParserDataFormat["GS1AI"] = "gs1ai";
    ParserDataFormat["HIBC"] = "hibc";
    /**
     * @deprecated ParserDataFormat.DLID
     * Use ID Capture instead.
     */
    ParserDataFormat["DLID"] = "dlid";
    /**
     * @deprecated ParserDataFormat.MRTD
     * Use ID Capture instead.
     */
    ParserDataFormat["MRTD"] = "mrtd";
    ParserDataFormat["SwissQR"] = "swissQr";
    ParserDataFormat["VIN"] = "vin";
    /**
     * @deprecated ParserDataFormat.UsUsid
     * Use ID Capture instead.
     */
    ParserDataFormat["UsUsid"] = "usUsid";
})(exports.ParserDataFormat || (exports.ParserDataFormat = {}));

initializeCordovaParser();

exports.ParsedData = ParsedData;
exports.ParsedField = ParsedField;
exports.Parser = Parser;
