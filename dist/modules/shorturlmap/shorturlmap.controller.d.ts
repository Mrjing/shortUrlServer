import { ShortUrlMapService } from './shorturlmap.service';
import { PRIMARY_ENV } from '../../constants';
import { HashService } from '@/services/hash.service';
import { RedisService } from '@/services/redis.service';
import { BloomFilterService } from '@/services/bloomFilter.service';
interface ICreateShortUrlReq {
    longUrl: string;
    expireTime?: number;
}
interface IDeleteShortUrlMapReq {
    shortUrl?: string;
}
export declare const EnvIdToShortFlagMap: {
    "shorturl-server-9gcdhkphe26cf284": string;
};
export declare class ShortUrlMapController {
    private readonly shortUrlService;
    private readonly hashServive;
    private readonly redisService;
    private readonly bloomFilterService;
    constructor(shortUrlService: ShortUrlMapService, hashServive: HashService, redisService: RedisService, bloomFilterService: BloomFilterService);
    getLongUrl(query?: {
        shortUrl?: string;
    }): Promise<any>;
    deleteShortUrlMap(body: IDeleteShortUrlMapReq): Promise<void>;
    createShortUrl(body: ICreateShortUrlReq, req: any): Promise<string>;
    private idToShortUrl;
    private shortUrlToId;
    private transformReqShortUrl;
}
export {};
