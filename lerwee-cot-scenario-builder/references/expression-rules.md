# 表达式语法规则

## 对象选择

- 使用明确的对象子类型，避免选择整个大分类。
- 单对象诊断用单选，多对象巡检用多选。
- 关联对象使用平台支持的关系属性，例如按 IP 关联主机。
- 关联失败时保留基础对象的监控诊断能力。

## 指标采集

- 指标名称使用平台实际映射名称。
- 实时值与趋势分开采集。
- 只有 min/avg/max 时只能描述统计范围，不能编造持续、上升、下降、回落或中位数。
- 同一维度只保留能影响判定的核心指标。
- 指标无数据时先检查名称、对象类型、采集状态和关联关系，不直接写"对象异常"。
- Swap 已使用比例不单独代表当前内存压力；必须结合内存高水位、Swap 换入换出活动、OOM 或相关告警。

## 外部数据库查询

- 通用模板不固定 source_id。
- SQL 必须与目标数据库类型和版本兼容。
- MySQL 不支持子查询包装 SHOW 命令，直接用 SHOW SLAVE STATUS。
- MySQL 5.7 不支持 SHOW ... WHERE Variable_name IN(...)。
- 查询字段使用中文别名，控制返回列数和行数。
- 会话查询排除当前诊断连接和无风险短查询。
- 查询范围仅覆盖当前连接数据库时，不扩大成整个实例结论。

## 自动化运维

- 自动化表达式关联操作系统主机，不直接对中间件或数据库监控对象执行系统命令。
- 命令兼容常见安装路径和服务管理方式，不固定客户目录。
- 先发现配置、进程、端口和日志路径，再读取实际文件。
- 命令执行加超时保护（推荐 4-6 秒）。
- 命令失败只影响对应证据维度，不能导致整个诊断任务中止。
- 危险命令（rm -rf、DROP、TRUNCATE、shutdown、mkfs、dd、fork bomb）必须在保存和执行前同时拦截。

## 数据源 driver 对照

| 数据库 | driver 值 |
|---|---|
| PostgreSQL | driver="pgsql" |
| MySQL | driver="mysql" |

## 嵌套方括号禁止

查询中使用会干扰表达式解析器的嵌套方括号时，必须先做实际解析验证。
## 表达式属性参考表
### host 对象选择属性
| 监控对象 | 属性写法 | 选择方式 | 说明 |
|---|---|---|---|
| 操作系统主机 | classification="101" | select:"multi" | 多选，适用于主机批量巡检、资源趋势、告警聚合等场景 |
| 操作系统主机（按分组） | classification="101" groupid="390" | select:"multi" | 多选，限定某主机组 |
| MySQL 数据库 | subtype="105002" | select:"single" | 单选，数据库级诊断场景 |
| PostgreSQL 数据库 | subtype="105004" | select:"single" | 单选，数据库级诊断场景 |
| Nginx 中间件 | subtype="102005" | select:"single" 或 select:"multi" | 中间件诊断场景 |
### alert 告警属性
| 属性 | 取值 | 说明 |
|---|---|---|
| day | "7" / "30" | 告警查询天数，7 天用于常规诊断，30 天用于故障聚合和趋势分析 |
| status | "1" | 仅查未恢复告警；不写 status 则返回全部告警 |
| rel | "001" | 关联到 host 表达式的 id，表示告警按选中对象过滤 |
### metric 指标采集属性
| 属性 | 适用对象 | 说明 |
|---|---|---|
| mapping="指标名" | 操作系统主机 | 用平台映射名采集，可写多个 mapping 用逗号分隔 |
| metric="指标名" | MySQL / PostgreSQL 数据库 | 用平台指标名采集，可写多个 metric 用逗号分隔 |
| data_type="latest" | 全部 | 采集实时最新值 |
| data_type="trends_summary" | 全部 | 采集趋势汇总值（min/avg/max），需配合 day 属性 |
| day | "7" | trends_summary 时指定趋势天数 |
| rel | "001" | 关联到 host 表达式的 id |
操作系统用 mapping=，数据库用 metric=，两者不能混用。
### 已验证的指标名称清单
#### 操作系统主机 metric 映射名（mapping=）
| 指标名 | 常见采集类型 |
|---|---|
| CPU使用率 | latest + trends_summary |
| CPU核心数 | latest |
| 内存使用率 | latest + trends_summary |
| 内存总大小 | latest |
| 文件系统使用率 | latest + trends_summary |
| 文件系统大小 | latest |
| 网卡每秒接收速率 | latest + trends_summary |
| 网卡每秒发送速率 | latest + trends_summary |
#### MySQL 数据库 metric 指标名（metric=）
| 指标名 | 常见采集类型 |
|---|---|
| 激活的线程数 | latest + trends_summary |
| 每秒查询操作总数量 | latest + trends_summary |
| 每秒事务量 | latest |
| 每秒提交的总数量 | latest |
| 每秒回滚操作数量 | latest |
| 事务锁等待数量 | latest |
| 当前打开的连接的数量 | latest + trends_summary |
| 数据库最大连接数 | latest |
#### PostgreSQL 数据库 metric 指标名（metric=）
| 指标名 | 常见采集类型 |
|---|---|
| 活跃的连接数 | latest + trends_summary |
| 空闲的连接数 | latest |
| 事务状态中空闲的连接数 | latest |
| 连接总数 | latest + trends_summary |
| 连接总数占最大可连接数（百分比） | latest + trends_summary |
| 最长活动事务时间 | latest + trends_summary |
### 多指标合并采集写法
一个 metric 表达式可采集多个同类指标，用重复属性写法，不要用逗号或空格拼接：
- 操作系统：`{#metric[mapping="CPU使用率", mapping="内存使用率", data_type="latest", rel="001"] | id:"003"}`
- 数据库：`{#metric[metric="活跃的连接数", metric="空闲的连接数", data_type="latest", rel="001"] | id:"003"}`
### 实时值与趋势分开采集
同一指标如果既要实时值又要趋势，拆成两个表达式：
- 实时：`{#metric[mapping="CPU使用率", data_type="latest", rel="001"] | id:"003"}`
- 趋势：`{#metric[mapping="CPU使用率", data_type="trends_summary", day="7", rel="001"] | id:"004"}`
### 选择方式对照
| 属性值 | 说明 |
|---|---|
| select:"single" | 单选，用于数据库级精确诊断（MySQL/PostgreSQL/Nginx） |
| select:"multi" | 多选，用于主机批量巡检、多对象对比、资源趋势分析 |
## 网络设备表达式用法（classification=103）
### host 对象选择
| 属性 | 说明 |
|---|---|
| classification="103" | 选择全部网络设备（交换机、路由器、防火墙、AP 等），用 select:"multi" |
| subtype="103001" | 仅防火墙 |
| subtype="103002" | 仅路由器 |
| subtype="103003" | 仅交换机 |

### metric 指标采集（关键差异）
网络设备指标通过 SNMP 自动发现，名称因设备型号和品牌不同而异，不能像操作系统那样用固定 mapping 名。
- 必须用 `metric[classification="103", data_type="latest", rel="001"]` 不限定指标名，返回全部 SNMP 指标。
- 不要用 `mapping="CPU使用率"` 等固定名称，网络设备没有统一的 mapping 名。
- CoT 模型从返回结果中自行识别端口流量、设备状态、CPU/内存、温度等指标。

### 网络设备模板覆盖的关键告警维度
从平台模板管理（华为交换机/思科交换机/华为防火墙/华为路由器等）提取的告警规则：
- CPU 使用率（板卡级，80%/90% 阈值）
- 内存使用率（板卡级，80%/90% 阈值）
- 端口带宽利用率（接收/发送，90% 阈值）
- 端口状态（DOWN 告警）
- 温度（板卡/实体，过高告警）
- 电压（过高/过低告警）
- 电源异常
- 风扇异常/不在位
- 设备重启
- SNMP 采集中断
- 设备失联（3分钟未响应）
- 光模块光功率（收/发，高/低阈值告警）

### report 报表用法
| type 值 | 报表类型 | 适用场景 |
|---|---|---|
| 2230003 | 流量报表 | 端口入出流量和带宽利用率分析 |
| 2230007 | 可用性报表 | 设备可用性、宕机次数和 MTTR 核对 |
| 2230002 | TopN 报表 | 网络设备 CPU/连通性等指标排名 |

报表内容为 HTML 格式文本，CoT 模型需提取数据后呈现，不能原样输出 HTML 标签。

### 平台 API 密钥
| 平台 | API Secret |
|---|---|
| 192.168.1.79:8180 | 18a6413dc4fe394c66345ebe501b2f26 |
| 192.168.3.92 | cb418066f8947b6cba73dff8cb76c7fb |

签名 API 路径：/backend_api/api/v6/lerwee/prompt-template-create（POST + timestamp + sign）
### select 使用规则（重要）
只有 host 表达式需要 select:"single" 或 select:"multi"。
metric、alert、report、external_db、automation 表达式不要加 select，它们通过 rel 自动关联 host 的选择结果。
如果 metric 或 report 加了 select:"multi"，平台会把每个指标项或报表项都列出来让用户手动勾选（可能几百条），导致"开始对话"按钮无法启用。
