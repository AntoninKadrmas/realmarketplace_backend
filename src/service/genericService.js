"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericService = void 0;
/**
 * Service generic class used as parent for other services.
 */
class GenericService {
    async connect() { }
    constructor() {
        this.collection = [];
    }
}
exports.GenericService = GenericService;
