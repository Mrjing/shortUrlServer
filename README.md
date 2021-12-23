# 项目介绍

基于 Nestjs + redis + Mysql 搭建的短链服务，对外提供生成短链及获取长链接口。

## 短链生成算法

基于 62 进制的字符串与数据库 ID 的转换，由于短链路径不能超过 8 个字符，本项目中预留 7 个字符作为短链生成内容（最多生成 62 的 7 次方条数据），第一个字符作为 hash 值（用于判断请求打到哪个 DB 节点）

### API 示例

基于长链生成短链

```bash
curl -X POST -d "longUrl=http://www.baidu.com" http://hostname/shortUrl
```

回包结构

```json
{
  "data": "" //
}
```

基于短链换回长链

```bash
curl http://hostname/shortUrl?shortUrl=
```

回包结构

```json
{
  "data": "" //
}
```

## 架构设计

### 架构图

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

### 时序图

## 参考资料

https://leetcode-cn.com/circle/discuss/EkCOT9/
https://xie.infoq.cn/article/483fcfbe3f942cb1fa9d9ce20
