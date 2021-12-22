import cloudbase from '@cloudbase/node-sdk';
export declare const getEnvIdString: () => string;
export declare const getCloudBaseApp: (envId: string) => cloudbase.CloudBase;
export declare const isRunInServerMode: () => boolean;
export declare const isInSCF: () => boolean;
export declare const isRunInContainer: () => boolean;
interface Secret {
    secretId: string;
    secretKey: string;
    token: string;
    expire: number;
}
export default class SecretManager {
    private tmpSecret;
    private TMP_SECRET_URL;
    constructor();
    getTmpSecret(): Promise<Secret>;
    private fetchTmpSecret;
    private get;
}
export declare function calSingleCharSub(a: string, b: string): number;
export {};
