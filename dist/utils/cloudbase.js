"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calSingleCharSub = exports.isRunInContainer = exports.isInSCF = exports.isRunInServerMode = exports.getCloudBaseApp = exports.getEnvIdString = void 0;
const request_1 = __importDefault(require("request"));
const node_sdk_1 = __importDefault(require("@cloudbase/node-sdk"));
let nodeAppMap = {};
exports.getEnvIdString = () => {
    const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID, ENV_ID } = process.env;
    return TCB_ENV || SCF_NAMESPACE || TCB_ENVID || ENV_ID;
};
exports.getCloudBaseApp = (envId) => {
    if (nodeAppMap[envId]) {
        return nodeAppMap[envId];
    }
    let options = {
        env: envId,
    };
    const app = node_sdk_1.default.init(options);
    nodeAppMap[envId] = app;
    return app;
};
exports.isRunInServerMode = () => process.env.NODE_ENV === 'development' ||
    !process.env.TENCENTCLOUD_RUNENV ||
    !!process.env.KUBERNETES_SERVICE_HOST;
exports.isInSCF = () => process.env.TENCENTCLOUD_RUNENV === 'SCF';
exports.isRunInContainer = () => !!process.env.KUBERNETES_SERVICE_HOST;
class SecretManager {
    constructor() {
        this.TMP_SECRET_URL =
            'http://metadata.tencentyun.com/meta-data/cam/security-credentials/TCB_QcsRole';
        this.tmpSecret = null;
    }
    async getTmpSecret() {
        if (this.tmpSecret) {
            const now = new Date().getTime();
            const expire = this.tmpSecret.expire * 1000;
            const oneHour = 3600 * 1000;
            if (now < expire - oneHour) {
                return this.tmpSecret;
            }
            else {
                return this.fetchTmpSecret();
            }
        }
        else {
            return this.fetchTmpSecret();
        }
    }
    async fetchTmpSecret() {
        const body = await this.get(this.TMP_SECRET_URL);
        const payload = JSON.parse(body);
        this.tmpSecret = {
            secretId: payload.TmpSecretId,
            secretKey: payload.TmpSecretKey,
            expire: payload.ExpiredTime,
            token: payload.Token,
        };
        return this.tmpSecret;
    }
    get(url) {
        return new Promise((resolve, reject) => {
            request_1.default.get(url, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(body);
                }
            });
        });
    }
}
exports.default = SecretManager;
function calSingleCharSub(a, b) {
    return a.charCodeAt(0) - b.charCodeAt(0);
}
exports.calSingleCharSub = calSingleCharSub;
//# sourceMappingURL=cloudbase.js.map