import { request } from "urllib";
import * as dotenv from 'dotenv';
dotenv.config();

export class StringIndexAdvert{
    private baseUrl = 'https://cloud.mongodb.com/api/atlas/v1.0'
    private projectId = process.env.MONGO_PROJECT_ID
    private clusterName = process.env.MONGO_CLUSTER_NAME
    private publicKey = process.env.MONGO_SEARCH_EDITOR_PUBLIC_KEY
    private privateKey = process.env.MONGO_SEARCH_EDITOR_PRIVATE_KEY
    private auth  = `${this.publicKey}:${this.privateKey}`
    private clusterApiUrl = `${this.baseUrl}/groups/${this.projectId}/clusters/${this.clusterName}`
    private searchIndexUrl = `${this.clusterApiUrl}/fts/indexes`
    private db=process.env.MONGO_DB_NAME?.toString()!
    private collection=process.env.MONGO_ADVERT_COLLECTION?.toString()!
    private indexName=process.env.MONGO_SEARCH_INDEX_ADVERT_NAME?.toString()!
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