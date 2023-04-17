import { request } from "urllib";
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * A class for managing a MongoDB full-text search index for an advert collection.
 */
export class StringIndexAdvert{
    private baseUrl = 'https://cloud.mongodb.com/api/atlas/v1.0'
    private projectId = process.env.MONGO_PROJECT_ID
    private clusterName = process.env.MONGO_CLUSTER_NAME
    private publicKey = process.env.MONGO_SEARCH_EDITOR_PUBLIC_KEY
    private privateKey = process.env.MONGO_SEARCH_EDITOR_PRIVATE_KEY
    private auth  = `${this.publicKey}:${this.privateKey}`
    private clusterApiUrl = `${this.baseUrl}/groups/${this.projectId}/clusters/${this.clusterName}`
    private searchIndexUrl = `${this.clusterApiUrl}/fts/indexes`
    private db=process.env.MONGO_DB_NAME
    private collection=process.env.MONGO_ADVERT_COLLECTION
    private indexName=process.env.MONGO_SEARCH_INDEX_ADVERT_NAME!== undefined ? process.env.MONGO_SEARCH_INDEX_ADVERT_NAME.toString() : ''
    /**
     * Determines if a search index with the specified name exists for the adverts collection.
     *
     * @param indexName The name of the search index to check for existence.
     * @returns A boolean indicating if the search index exists or not.
     * @private
     */
    private async existsSearchIndex(indexName:string):Promise<boolean>{
        const allSetINdexes = await request(
            `${this.searchIndexUrl}/${this.db}/${this.collection}`,{
                dataType:'json',
                contentType:"application/json",
                method:'GET',
                digestAuth:this.auth
            }
        )
        return !((allSetINdexes.data as any[]).find(x=>x.name==indexName))
    }
    /**
     * Creates a new search index for the adverts collection if one with the specified name does not already exist.
     */
    async setSearchIndex(){
        if(await this.existsSearchIndex(this.indexName))
            await request(this.searchIndexUrl,{
                data: {
                    database:this.db,
                    collectionName:this.collection,
                    name:this.indexName,
                    mappings:{
                        dynamic:true
                    }
                },
                dataType:'json',
                contentType:"application/json",
                method:'POST',
                digestAuth:this.auth
            })
    }
}