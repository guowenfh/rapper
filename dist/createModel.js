"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var axios_1 = require("axios");
var json_schema_to_typescript_1 = require("json-schema-to-typescript");
var formatter_1 = require("json-schema-to-typescript/dist/src/formatter");
var _ = require("lodash");
var chalk_1 = require("chalk");
var convert_1 = require("./convert");
var createRedux_1 = require("./redux/createRedux");
var utils_1 = require("./utils");
function formatCode(code) {
    return formatter_1.format(code, json_schema_to_typescript_1.DEFAULT_OPTIONS);
}
function getIntfWithModelName(intfs, urlMapper) {
    if (urlMapper === void 0) { urlMapper = function (t) { return t; }; }
    return intfs.map(function (itf) {
        return __assign({}, itf, { modelName: rap2name(itf, urlMapper) });
    });
}
function uniqueItfs(itfs) {
    var itfMap = new Map();
    itfs.forEach(function (itf) {
        var name = itf.modelName;
        if (itfMap.has(name)) {
            itfMap.get(name).push(itf);
        }
        else {
            itfMap.set(name, [itf]);
        }
    });
    var newItfs = [];
    itfMap.forEach(function (dupItfs, name) {
        dupItfs.sort(
        // 后更改的在前面
        function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); });
        newItfs.push(dupItfs[0]);
        if (dupItfs.length > 1) {
            console.log(chalk_1["default"].yellow('发现重复接口，修改时间最晚的被采纳：\n') +
                dupItfs
                    .map(function (itf, index) {
                    var str = itf.name + ": http://rap2.alibaba-inc.com/repository/editor?id=" + itf.repositoryId + "&mod=" + itf.moduleId + "&itf=" + itf.id;
                    return index === 0 ? chalk_1["default"].green(str) : chalk_1["default"].gray(str);
                })
                    .join('\n') +
                '\n');
        }
    });
    return newItfs;
}
function rap2name(itf, urlMapper) {
    if (urlMapper === void 0) { urlMapper = function (t) { return t; }; }
    // copy from http://gitlab.alibaba-inc.com/thx/magix-cli/blob/master/util/rap.js
    var method = itf.method.toLowerCase();
    var apiUrl = urlMapper(itf.url);
    var projectId = itf.repositoryId;
    var id = itf.id;
    var regExp = /^(?:https?:\/\/[^\/]+)?(\/?.+?\/?)(?:\.[^./]+)?$/;
    var regExpExec = regExp.exec(apiUrl);
    if (!regExpExec) {
        console.log(chalk_1["default"].red("\n  \u2718 \u60A8\u7684rap\u63A5\u53E3url\u8BBE\u7F6E\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u53C2\u8003\u683C\u5F0F\uFF1A/api/test.json (\u63A5\u53E3url:" + apiUrl + ", \u9879\u76EEid:" + projectId + ", \u63A5\u53E3id:" + id + ")\n"));
        return;
    }
    var urlSplit = regExpExec[1].split('/');
    //接口地址为RESTful的，清除占位符
    //api/:id/get -> api//get
    //api/bid[0-9]{4}/get -> api//get
    urlSplit.forEach(function (item, i) {
        if (/\:id/.test(item)) {
            urlSplit[i] = '$id';
        }
        else if (/[\[\]\{\}]/.test(item)) {
            urlSplit[i] = '$regx';
        }
    });
    //只去除第一个为空的值，最后一个为空保留
    //有可能情况是接口 /api/login 以及 /api/login/ 需要同时存在
    if (urlSplit[0].trim() === '') {
        urlSplit.shift();
    }
    urlSplit.push(method);
    var urlToName = urlSplit.join('_');
    return urlToName;
}
function getInterfaces(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, modules, collaborators, interfaces, collaboratorsInterfaces;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1["default"].get("http://rap2api.alibaba-inc.com/repository/get?id=" + projectId)];
                case 1:
                    response = _a.sent();
                    data = response.data.data;
                    modules = data.modules;
                    collaborators = data.collaborators;
                    interfaces = _(modules)
                        .map(function (m) { return m.interfaces; })
                        .flatten()
                        .value();
                    if (!collaborators.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all(collaborators.map(function (e) { return getInterfaces(e.id); }))];
                case 2:
                    collaboratorsInterfaces = _a.sent();
                    interfaces = interfaces.concat(_.flatten(collaboratorsInterfaces));
                    _a.label = 3;
                case 3: return [2 /*return*/, interfaces];
            }
        });
    });
}
function createModel(_a) {
    var projectId = _a.projectId, modelPath = _a.modelPath, requesterPath = _a.requesterPath, baseFetchPath = _a.baseFetchPath, _b = _a.urlMapper, urlMapper = _b === void 0 ? function (t) { return t; } : _b, _c = _a.useCommonJsModule, useCommonJsModule = _c === void 0 ? false : _c, _d = _a.additionalProperties, additionalProperties = _d === void 0 ? false : _d, _e = _a.optionalExtra, optionalExtra = _e === void 0 ? true : _e, _f = _a.type, type = _f === void 0 ? 'magix' : _f, _g = _a.outputPath, outputPath = _g === void 0 ? '../model' : _g;
    return __awaiter(this, void 0, void 0, function () {
        var outputFiles, interfaces, _h, _j, itfStrs, modelItf, relBaseFetchPath, relModelPath, relBaseFetchPath, fetcher;
        var _this = this;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    outputFiles = [];
                    _h = uniqueItfs;
                    _j = getIntfWithModelName;
                    return [4 /*yield*/, getInterfaces(projectId)];
                case 1:
                    interfaces = _h.apply(void 0, [_j.apply(void 0, [_k.sent(), urlMapper])]);
                    return [4 /*yield*/, Promise.all(interfaces.map(function (itf) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, reqItf, resItf, error_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, convert_1["default"](itf, additionalProperties)];
                                    case 1:
                                        _a = _b.sent(), reqItf = _a[0], resItf = _a[1];
                                        return [2 /*return*/, "\n          /**\n           * \u63A5\u53E3\u540D\uFF1A" + itf.name + "\n           * Rap \u5730\u5740: http://rap2.alibaba-inc.com/repository/editor?id=" + itf.repositoryId + "&mod=" + itf.moduleId + "&itf=" + itf.id + "\n           */\n          '" + itf.modelName + "': {\n            Req: " + reqItf.replace('export interface Req', '') + ";\n            Res: " + resItf.replace('export interface Res', '') + ";\n          }\n        "];
                                    case 2:
                                        error_1 = _b.sent();
                                        throw chalk_1["default"].red("\u63A5\u53E3\uFF1Ahttp://rap2.alibaba-inc.com/repository/editor?id=" + itf.repositoryId + "&mod=" + itf.moduleId + "&itf=" + itf.id + "\n        \u751F\u6210\u51FA\u9519\n        " + error_1);
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    itfStrs = _k.sent();
                    modelItf = formatCode("\n    /**\n     * \u672C\u6587\u4EF6\u7531 Rapper \u4ECE Rap \u4E2D\u81EA\u52A8\u751F\u6210\uFF0C\u8BF7\u52FF\u4FEE\u6539\n     * Rap \u5730\u5740: http://rap2.alibaba-inc.com/repository/editor?id=" + projectId + "\n     */\n    export interface ModelItf {\n      " + itfStrs.join('\n\n') + "\n    };\n    ");
                    console.log('outputPath', outputPath);
                    outputFiles.push({
                        path: outputPath ? outputPath + "/model.ts" : modelPath,
                        content: modelItf
                    });
                    if (type === 'redux') {
                        if (!outputPath) {
                            console.log(chalk_1["default"].red('配置文件中 outputPath 不能为空'));
                            return [2 /*return*/];
                        }
                        /** 生成 redux.ts */
                        outputFiles.push({
                            path: outputPath + "/redux.ts",
                            content: formatCode(createRedux_1.createReduxStr(projectId, interfaces))
                        });
                        relBaseFetchPath = utils_1.relativeImport(outputPath + "/fetch.ts", baseFetchPath);
                        outputFiles.push({
                            path: outputPath + "/fetch.ts",
                            content: formatCode(createRedux_1.createReduxFetchStr(projectId, interfaces, relBaseFetchPath))
                        });
                    }
                    else if (requesterPath) {
                        relModelPath = utils_1.relativeImport(requesterPath, modelPath);
                        relBaseFetchPath = utils_1.relativeImport(requesterPath, baseFetchPath);
                        fetcher = formatCode("\n          /**\n           * \u672C\u6587\u4EF6\u7531 Rapper \u4ECE Rap \u4E2D\u81EA\u52A8\u751F\u6210\uFF0C\u8BF7\u52FF\u4FEE\u6539\n           * Rap \u5730\u5740: http://rap2.alibaba-inc.com/repository/editor?id=" + projectId + "\n           */\n        " + (useCommonJsModule
                            ? "\n          import fetch =  require('" + relBaseFetchPath + "');\n          import { ModelItf } from '" + relModelPath + "';\n          "
                            : "\n          import fetch from '" + relBaseFetchPath + "';\n          import { ModelItf } from '" + relModelPath + "';\n        ") + "\n          type Extra = Parameters<typeof fetch>[3];\n          const request = {\n            " + interfaces
                            .map(function (itf) {
                            var modelName = itf.modelName;
                            return "\n              /**\n               * \u63A5\u53E3\u540D\uFF1A" + itf.name + "\n               * Rap \u5730\u5740: http://rap2.alibaba-inc.com/repository/editor?id=" + itf.repositoryId + "&mod=" + itf.moduleId + "&itf=" + itf.id + "\n              * @param req \u8BF7\u6C42\u53C2\u6570\n              * @param extra \u8BF7\u6C42\u914D\u7F6E\u9879\n              */\n              '" + modelName + "': (req: ModelItf['" + modelName + "']['Req'], extra" + (optionalExtra ? '?' : '') + ": Extra) => {\n                return fetch<ModelItf['" + modelName + "']['Res']>('" + itf.url + "','" + itf.method.toUpperCase() + "', req, extra);\n              }";
                        })
                            .join(',\n\n') + "\n          };\n    \n        " + (useCommonJsModule
                            ? "\n          export = request;\n          "
                            : "\n          export default request;\n          ") + "\n        ");
                        outputFiles.push({ path: requesterPath, content: fetcher });
                    }
                    return [2 /*return*/, Promise.all(outputFiles.map(function (_a) {
                            var path = _a.path, content = _a.content;
                            return utils_1.writeFile(path, content);
                        }))];
            }
        });
    });
}
exports["default"] = createModel;
