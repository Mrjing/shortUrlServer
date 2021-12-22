import { Injectable, NestMiddleware, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import { parse } from 'url';
import { BloomFilterService } from '../services/bloomFilter.service'

@Injectable()
export class filterMiddleware implements NestMiddleware {
    constructor(
        private readonly bloomFilterService: BloomFilterService,
    ) { }
    async use(req: Request, res: Response, next: Function) {
        const method = req.method
        const query = req.query

        if ((method === 'get' || method === 'GET') && query) {
            const { shortUrl } = query
            if (!shortUrl) {
                // get请求 不存在shortUrl 则报错
                res.end(JSON.stringify({
                    code: 'INVALID_PARAMS',
                    message: 'please set the shortUrl value in url query'
                }));
            } else {
                // bloomFilter 检查
                console.log('shortUrl', shortUrl)
                const url = new URL(shortUrl)
                const urlPathname = url.pathname
                const urlHost = url.hostname

                // shortUrl host 与 req host 不一致
                if (urlHost !== req.hostname) {
                    res.end(JSON.stringify({
                        code: 'INVALID_SHORTURL',
                        message: 'invalid short url hostname'
                    }))
                }
                // pathname长度一定大于2 （/ + 存在一位hash位）
                if (urlPathname.length <= 2) {
                    res.end(JSON.stringify({
                        code: 'INVALID_SHORTURL',
                        message: 'invalid short url'
                    }))
                    return
                }
                const pathnameValue = urlPathname.substring(1) // 获取 / 之后的字符串
                console.log('pathnameValue', pathnameValue)
                const isMayExistInDb = await this.bloomFilterService.hasItemInBloomFilter(pathnameValue)
                console.log('isMayExistInDb', isMayExistInDb)
                if (isMayExistInDb) {
                    next()
                    return
                } else {
                    // 不存在则报错
                    res.end(JSON.stringify({
                        code: 'INVALID_SHORTURL',
                        message: 'invalid short url'
                    }))
                    return
                }
            }
        }

        next();
    }
}
