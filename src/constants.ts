// 62 进制字符取值范围
export const CHARIN62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export const redisConfig = {
    host: 'sh-crs-a5v7i5ba.sql.tencentcdb.com',
    port: '27820',
    password: '33333333ll'
}

export const ERROR = {
    INVALID_SHORTURL: {
        code: 'INVALID_SHORTURL',
        message: 'short url is invalid, please check'
    },
    INVALID_LONGURL: {
        code: 'INVALID_LONGURL',
        message: 'long url is invalid, please check'
    },
    SYS_ERR: {
        code: 'SYS_ERR',
        message: 'some system error' // 暂未归类的系统异常
    }
}