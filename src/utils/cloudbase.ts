import request from 'request'
import cloudbase, { CloudBase, ICallFunctionRes } from '@cloudbase/node-sdk'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'

let nodeAppMap: {
    [key: string]: CloudBase
} = {}

/**
 * 从环境变量中获取 envId
 */
export const getEnvIdString = (): string => {
    const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID, ENV_ID } = process.env
    return TCB_ENV || SCF_NAMESPACE || TCB_ENVID || ENV_ID
}

/**
 * 获取初始化后的 cloudbase node sdk 实例
 */
export const getCloudBaseApp = (envId: string) => {
    if (nodeAppMap[envId]) {
        return nodeAppMap[envId]
    }

    let options: ICloudBaseConfig = {
        env: envId,
    }

    const app = cloudbase.init(options)
    nodeAppMap[envId] = app
    return app
}

// 以服务器模式运行，即通过监听端口的方式运行
export const isRunInServerMode = () =>
    process.env.NODE_ENV === 'development' ||
    !process.env.TENCENTCLOUD_RUNENV ||
    !!process.env.KUBERNETES_SERVICE_HOST

// 是否在云函数中运行
export const isInSCF = () => process.env.TENCENTCLOUD_RUNENV === 'SCF'

// 是否在云托管中运行
export const isRunInContainer = () => !!process.env.KUBERNETES_SERVICE_HOST

interface Secret {
    secretId: string
    secretKey: string
    token: string
    expire: number // 过期时间，单位：秒
}

/**
 * 从容器运行环境中获取临时秘钥
 */
export default class SecretManager {
    private tmpSecret: Secret | null
    private TMP_SECRET_URL: string
    public constructor() {
        this.TMP_SECRET_URL =
            'http://metadata.tencentyun.com/meta-data/cam/security-credentials/TCB_QcsRole'
        this.tmpSecret = null
    }

    public async getTmpSecret(): Promise<Secret> {
        if (this.tmpSecret) {
            const now = new Date().getTime()
            const expire = this.tmpSecret.expire * 1000
            const oneHour = 3600 * 1000
            if (now < expire - oneHour) {
                // 密钥没过期
                return this.tmpSecret
            } else {
                // 密钥过期
                return this.fetchTmpSecret()
            }
        } else {
            return this.fetchTmpSecret()
        }
    }

    private async fetchTmpSecret(): Promise<Secret> {
        const body: any = await this.get(this.TMP_SECRET_URL)
        const payload = JSON.parse(body)

        this.tmpSecret = {
            secretId: payload.TmpSecretId,
            secretKey: payload.TmpSecretKey,
            expire: payload.ExpiredTime, // 过期时间，单位：秒
            token: payload.Token,
        }

        return this.tmpSecret
    }

    private get(url) {
        return new Promise((resolve, reject) => {
            request.get(url, (err, res, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(body)
                }
            })
        })
    }
}

/**
 * 计算2个单字符减法
 *
 * @export
 */
export function calSingleCharSub(a: string, b: string) {
    return a.charCodeAt(0) - b.charCodeAt(0)
}