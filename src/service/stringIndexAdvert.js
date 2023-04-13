"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.StringIndexAdvert = void 0;
const urllib_1 = require("urllib");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class StringIndexAdvert {
    constructor() {
        this.baseUrl = 'https://cloud.mongodb.com/api/atlas/v1.0';
        this.projectId = process.env.MONGO_PROJECT_ID;
        this.clusterName = process.env.MONGO_CLUSTER_NAME;
        this.publicKey = process.env.MONGO_SEARCH_EDITOR_PUBLIC_KEY;
        this.privateKey = process.env.MONGO_SEARCH_EDITOR_PRIVATE_KEY;
        this.auth = `${this.publicKey}:${this.privateKey}`;
        this.clusterApiUrl = `${this.baseUrl}/groups/${this.projectId}/clusters/${this.clusterName}`;
        this.searchIndexUrl = `${this.clusterApiUrl}/fts/indexes`;
        this.db = process.env.MONGO_DB_NAME;
        this.collection = process.env.MONGO_ADVERT_COLLECTION;
        this.indexName = process.env.MONGO_SEARCH_INDEX_ADVERT_NAME !== undefined ? process.env.MONGO_SEARCH_INDEX_ADVERT_NAME.toString() : '';
    }
    existsSearchIndex(indexName) {
        return __awaiter(this, void 0, void 0, function* () {
            const allSetINdexes = yield (0, urllib_1.request)(`${this.searchIndexUrl}/${this.db}/${this.collection}`, {
                dataType: 'json',
                contentType: "application/json",
                method: 'GET',
                digestAuth: this.auth
            });
            return !(allSetINdexes.data.find(x => x.name == indexName));
        });
    }
    setSearchIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.existsSearchIndex(this.indexName))
                yield (0, urllib_1.request)(this.searchIndexUrl, {
                    data: {
                        database: this.db,
                        collectionName: this.collection,
                        name: this.indexName,
                        mappings: {
                            dynamic: true
                        }
                    },
                    dataType: 'json',
                    contentType: "application/json",
                    method: 'POST',
                    digestAuth: this.auth
                });
        });
    }
}
exports.StringIndexAdvert = StringIndexAdvert;
