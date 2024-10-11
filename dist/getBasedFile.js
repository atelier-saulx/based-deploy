"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasedFile = void 0;
const find_up_1 = require("find-up");
const fs_extra_1 = require("fs-extra");
const bundle_1 = require("@based/bundle");
const getBasedFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file || !file.length) {
        throw new Error();
    }
    const basedFile = yield (0, find_up_1.findUp)(file);
    let basedFileContent = {};
    const basedProject = {};
    if (basedFile) {
        if (basedFile.endsWith('.json')) {
            console.log('É JSON');
            basedFileContent = yield (0, fs_extra_1.readJSON)(basedFile);
        }
        else {
            console.log('NÃO É JSON');
            const bundled = yield (0, bundle_1.bundle)({
                entryPoints: [basedFile],
            });
            const compiled = bundled.require();
            basedFileContent = compiled.default || compiled;
        }
        Object.assign(basedProject, basedFileContent);
        return basedProject;
    }
    else {
        throw new Error();
    }
});
exports.getBasedFile = getBasedFile;
