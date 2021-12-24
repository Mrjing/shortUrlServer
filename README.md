# 项目介绍

基于 Nestjs + redis + Mysql 搭建的短链服务，对外提供生成短链及获取长链接口。

## 短链生成算法

基于 62 进制的字符串与数据库 ID 的转换，由于短链路径不能超过 8 个字符，本项目中预留 7 个字符作为短链生成内容（最多生成 62 的 7 次方条数据），第一个字符作为 hash 值（用于判断请求打到哪个 DB 节点）

## API 示例

基于长链生成短链

```bash
curl -X POST -d "longUrl=http://www.baidu.com" https://f-xj.cn/shortUrl
```

回包结构

```json
{
  "data": "http://f-xj.cn/1b" //
}
```

基于短链换回长链

```bash
curl https://f-xj.cn/shortUrl?shortUrl=https://f-xj.cn/1b
```

回包结构

```json
{
  "data": "http://www.baidu.com" //
}
```

## 架构设计

### 架构图

![](https://qcloudimg.tencent-cloud.cn/raw/3e0c07379d2206a6f5b3e7c62f361df2.png)

> 架构说明
>
> 1. gateway 为云开发网关接入层，可以提供云上资源（如本项目中云托管）的 HTTP 访问，支持自定义域名,路由配置,就近接入访问等能力。
> 2. 云托管为云上基于容器资源的托管平台，项目服务部署在该资源上，拥有版本灰度，流量调节，自动扩容等能力。

### 时序图

![](https://qcloudimg.tencent-cloud.cn/raw/9b08c4b43147f3c78c4e06811cb3de58.png)

#### 缓存设计

1. 基于 redis 实现的布隆过滤器（使用 bloom-redis 库），用于短链换取长链接口时，检查短链是否可能在 DB 中，拦截一定不在 DB 的请求。
2. 基于 redis 做接口的缓存设计，写入长短链映射至 DB 时，同时写入 Redis 缓存（可设置有效期），读取映射时优先读缓存，未获取到则查 DB。

#### 数据库多节点

> 考虑大数据量情况，通过分布式部署多个 DB 来缓解压力（本项目引入 2 个 DB），通过一致性 hash 保证写入与访问的是同个 DB，详细描述如下

##### 获取短域名

1. 将原域名哈希成 0，1 作为哈希值 hash_val
2. 用 hash_val 定位到对应 DB。
3. 将原域名插入数据库，获取短域名 shortUrl。将 hash_val 和 short_url 拼接为最终短域名 final_short_url（长度最多为 8）返回。

##### 获取长域名

1. 取 final_short_url 的第 1 个字符作为 hash_val
2. 用 hash_val 定位到对应 DB
3. 用 final_short_url 中剩余位作为 short_url 找到表中映射关系，将原域名 original_url 返回给用户

### 安全性

1. 数据库账密，平台提供的环境变量注入方式，避免被泄漏。
2. 防恶意攻击 DDOS，bloomfilter 能拦截大量无效请求

### 可用性

1. 读缓存，Redis 减少 DB 压力
2. 旁路降级，Redis 异常不影响请求访问 DB（但可能缓存击穿问题）
3. 容器 Pod 服务多节点，DB 多节点，减少单点问题

### 单元测试

![](https://qcloudimg.tencent-cloud.cn/raw/4e2328018ffab872a4d44e459248b7f3.jpg)

## 参考资料

https://leetcode-cn.com/circle/discuss/EkCOT9/
https://xie.infoq.cn/article/483fcfbe3f942cb1fa9d9ce20
