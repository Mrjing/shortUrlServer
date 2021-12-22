import { Module, MiddlewareConsumer } from '@nestjs/common';

// 引入数据库的及配置文件
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrlMapModule } from './modules/shorturlmap/shorturlmap.module';
import { filterMiddleware } from './middlewares/filter'
import { BloomFilterService } from './services/bloomFilter.service';
import { RedisService } from './services/redis.service'
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exception';


@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: '127.0.0.1',
            port: 3306,
            username: 'root',
            // password: 'root',
            database: 'test',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            name: 'primary', // 主库
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'sh-cdb-4op54oiq.sql.tencentcdb.com',
            port: 59276,
            username: 'root',
            password: '33883386kk',
            database: 'test',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            name: 'backup', // 从库
        }),
        ShortUrlMapModule
    ],
    providers: [
        BloomFilterService,
        RedisService,
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter
        }
        // ShortUrlMapService
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(filterMiddleware).forRoutes('*')
    }
    // constructor(private readonly connection: Connection) { }
}
