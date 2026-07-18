# Uplink 多 Agent 会话归档系统需求文档

## 1. 文档信息

- **项目名称**：Uplink
- **项目类型**：本地优先的多 Agent 会话归档与主题归集工具
- **核心组件**：
  - Uplink CLI
  - Uplink Capture Chrome 扩展
  - Uplink Bridge 本地通信桥
  - Uplink Archive 本地数据仓库
  - Uplink Briefing 主题背景包

- **目标用户**：希望长期拥有、备份、检索和分析个人 Agent 会话数据的个人用户
- **部署模式**：单机、本地优先、每台设备绑定一个仓库
- **主要技术形态**：全局 npm CLI + Chrome 扩展 + Native Messaging + 文件系统仓库

---

# 2. 项目背景

用户在 ChatGPT、Gemini、豆包、腾讯元宝等不同 Agent 平台中持续产生大量个人会话。

这些会话通常存在以下问题：

1. 数据分散在不同平台，无法统一管理；
2. 部分平台没有完整导出能力；
3. 平台导出格式互不兼容；
4. 用户无法稳定形成跨平台的长期个人语料库；
5. 同一主题可能被分散讨论在多个 Agent 和多个会话中；
6. 后续继续提问时，用户难以将相关历史背景完整带入新的 Agent；
7. 平台可能改版、停服、删除数据或限制历史访问；
8. 普通网页保存无法处理懒加载、虚拟列表和动态渲染。

Uplink 的目标不是替代这些 Agent，也不是管理 AI IDE 配置，而是建立一个由用户自己持有的 Agent 会话归档基础设施。

---

# 3. 项目定位

Uplink 是一个：

> 通过官方数据导出和浏览器捕获，将多个 Agent 平台中的个人会话备份到本地仓库，并为后续跨 Agent 检索、主题归集和背景信息生成提供统一数据基础的工具。

Uplink 需要同时保存：

- 平台提供的原始数据；
- 网页捕获产生的原始证据；
- 统一格式的标准化会话；
- 附件及其内容哈希；
- 每次导入和捕获的审计信息；
- 后续生成的主题背景资料。

---

# 4. 项目名称含义

“Uplink”来源于《红色警戒 2》盟军建筑 **Spy Satellite Uplink**。

该建筑代表信息汇聚与全局视野。对应到本项目：

- 不同 Agent 平台是分散的信息来源；
- 官方导出和 Chrome 扩展是数据上行通道；
- CLI 是本地接收与管理核心；
- 本地仓库是用户自己的信息中心；
- 主题归集结果形成新的全局视野。

项目正式名称使用 **Uplink**，避免 “Spy” 带来的监控和隐私负面联想。

---

# 5. 核心原则

## 5.1 本地优先

所有核心数据默认存储在用户指定的本地目录中。

Uplink 不要求中心化服务器，不默认上传会话内容，也不依赖云端账户才能管理数据。

## 5.2 用户拥有原始数据

系统不能只保存经过转换或总结后的内容。

每次导入或捕获都应尽量保留：

- 原始导出包；
- 原始解包文件；
- 原始接口响应；
- 原始 HTML 或页面片段；
- 页面地址和平台信息；
- 捕获时间；
- 解析器或捕获配置版本。

## 5.3 原始数据不可变

`raw/` 中的原始数据原则上只追加，不在原位置修改。

解析规则升级后，应重新从原始数据生成标准化结果，而不是覆盖原始证据。

## 5.4 数据可追溯

任何标准化消息、主题摘要和背景资料，都应能追溯到：

- 平台；
- 会话；
- 消息；
- 原始导入批次或捕获批次；
- 数据处理版本。

## 5.5 采集与存储分离

Chrome 扩展负责读取和操作网页。

CLI 负责：

- 仓库管理；
- 数据校验；
- 原子写入；
- 去重；
- 索引；
- 审计；
- 格式迁移。

扩展不得直接拥有任意本地文件操作权限。

## 5.6 每台设备一个仓库

每台设备只绑定一个 Uplink 仓库。

不提供日常多仓库切换功能，降低配置和误写复杂度。

用户需要更换仓库时，应通过显式重新绑定操作完成。

---

# 6. 核心目标

## 6.1 第一阶段目标

第一阶段需要实现：

1. 全局安装 Uplink CLI；
2. 在当前目录初始化本地仓库；
3. 将当前目录绑定为该设备唯一的 Uplink 仓库；
4. 导入 ChatGPT 官方导出数据；
5. 导入 Gemini 官方导出数据；
6. 保存原始导出包和解包内容；
7. 转换为统一会话格式；
8. 安装和管理 Chrome Native Messaging Bridge；
9. 通过 Chrome 扩展捕获豆包、腾讯元宝等网页会话；
10. 支持动态加载和虚拟列表会话；
11. 支持捕获校准；
12. 提供去重、校验、审计和基础查询能力。

## 6.2 后续阶段目标

后续阶段可实现：

1. 跨 Agent 全文检索；
2. 跨会话主题识别；
3. 按主题聚合相关历史片段；
4. 识别资料冲突和时间变化；
5. 生成带来源的主题背景包；
6. 将背景包导出为 Markdown、JSON 或 Agent 可直接使用的上下文；
7. 支持增量更新主题背景包；
8. 支持更多 Agent 平台；
9. 支持可选的本地向量索引和模型分析。

---

# 7. 非目标

第一阶段不包含：

1. 托管用户会话数据的中心化云服务；
2. 直接替代 ChatGPT、Gemini 等 Agent；
3. 实现跨平台自动登录；
4. 绕过平台权限或访问用户不可见数据；
5. 调用未经授权的私有接口；
6. 自动修改原平台中的会话；
7. 完整备份平台后台未下发的数据；
8. 多设备实时同步；
9. 多用户和团队权限系统；
10. 每台设备管理多个仓库；
11. 默认对所有会话执行大模型分析。

---

# 8. 用户使用场景

## 8.1 初始化个人仓库

用户全局安装 CLI：

```bash
npm install -g @digital-sovereignty/uplink
```

用户创建存储目录：

```bash
mkdir agent-archive
cd agent-archive
uplink init
```

`uplink init` 应：

1. 验证当前目录是否适合作为仓库；
2. 创建仓库目录结构；
3. 生成仓库配置文件；
4. 为仓库生成唯一 ID；
5. 将当前目录绑定为该设备唯一仓库；
6. 提示用户是否安装浏览器桥；
7. 输出下一步操作说明。

初始化完成后，用户可以在任意目录执行 Uplink 命令，CLI 始终操作已绑定仓库。

## 8.2 导入 ChatGPT 数据

用户将 ChatGPT 官方导出 ZIP 放入：

```text
<repository>/inbox/
```

执行：

```bash
uplink ingest
```

或者：

```bash
uplink import chatgpt ~/Downloads/chatgpt-export.zip
```

系统自动：

- 识别导出格式；
- 计算文件哈希；
- 保存原始 ZIP；
- 安全解压；
- 解析会话；
- 转换统一格式；
- 保存附件；
- 去重；
- 更新索引；
- 生成导入报告。

## 8.3 导入 Gemini 数据

用户通过 Google Takeout 等官方方式导出 Gemini 数据。

然后执行：

```bash
uplink import gemini ~/Downloads/takeout.zip
```

处理过程与 ChatGPT 导入流程一致，但使用 Gemini 专用解析器。

## 8.4 捕获豆包或元宝会话

用户打开豆包或元宝的目标会话页面，点击 Uplink Capture 扩展。

扩展执行：

1. 识别当前平台和页面；
2. 读取当前会话元数据；
3. 加载已有 Capture Profile；
4. 验证 Profile 是否仍然有效；
5. 自动展开可展开内容；
6. 自动向上加载历史消息；
7. 在滚动过程中持续提取消息；
8. 对消息进行临时去重；
9. 分批传输给 Uplink Bridge；
10. 由 CLI 写入 staging；
11. 完成后执行校验和原子提交；
12. 显示捕获结果。

## 8.5 对未知平台进行捕获校准

当平台没有正式适配器或现有规则失效时，用户进入捕获校准。

用户输入：

- 用户第一条消息的若干连续字符；
- Agent 第一条回答的若干连续字符。

扩展尝试：

1. 标准化锚点文本；
2. 在当前页面和动态加载内容中检索；
3. 找到候选文本节点；
4. 推断消息正文节点；
5. 推断单条消息根节点；
6. 推断消息列表和滚动容器；
7. 推断用户与 Agent 的角色区分规律；
8. 使用整页消息验证规则；
9. 展示捕获预览和置信度；
10. 经用户确认后保存为 Capture Profile。

找不到唯一候选时，用户可以在页面中手动点击：

- 一条用户消息；
- 一条 Agent 消息。

扩展再基于用户选择推断页面结构。

## 8.6 跨 Agent 主题归集

用户执行：

```bash
uplink context build "数字主权"
```

系统从 ChatGPT、Gemini、豆包、元宝等会话中检索相关消息，形成：

- 主题背景摘要；
- 相关历史观点；
- 已确定事实；
- 仍有争议或冲突的内容；
- 按时间排列的主题演进；
- 可追溯的证据列表。

背景包可以用于下一轮 Agent 提问。

---

# 9. 总体架构

```text
┌─────────────────────────────────────────────┐
│              外部 Agent 平台                │
│                                             │
│ ChatGPT / Gemini / 豆包 / 元宝 / 其他平台   │
└───────────────┬─────────────────┬───────────┘
                │                 │
         官方数据导出        Chrome 页面捕获
                │                 │
                ▼                 ▼
┌──────────────────────┐  ┌──────────────────────┐
│     Uplink CLI       │  │    Uplink Capture    │
│                      │  │    Chrome 扩展       │
│ 导入器 / 解析器      │  │                      │
│ 仓库管理             │  │ 页面识别             │
│ 数据标准化           │  │ 自动滚动             │
│ 校验与审计           │  │ 捕获校准             │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           │               Native Messaging
           │                         │
           └──────────────┬──────────┘
                          ▼
               ┌──────────────────────┐
               │    Uplink Bridge     │
               │                      │
               │ 消息校验             │
               │ 分块接收             │
               │ 仓库操作白名单       │
               └──────────┬───────────┘
                          ▼
               ┌──────────────────────┐
               │    Uplink Archive    │
               │                      │
               │ 原始数据             │
               │ 标准化会话           │
               │ 附件                 │
               │ 捕获记录             │
               │ 索引                 │
               │ 主题背景包           │
               └──────────────────────┘
```

---

# 10. 组件职责

## 10.1 Uplink CLI

CLI 是系统核心。

负责：

- 初始化仓库；
- 绑定当前设备唯一仓库；
- 查询仓库状态；
- 导入官方导出数据；
- 调用平台解析器；
- 管理 Native Messaging Host；
- 接收浏览器扩展数据；
- 数据去重；
- 内容哈希；
- 原子写入；
- 仓库锁；
- 数据校验；
- 索引构建；
- 格式迁移；
- 审计报告；
- 主题归集与导出。

CLI 不负责操作网页。

## 10.2 Uplink Capture Chrome 扩展

扩展负责：

- 识别网页平台；
- 读取当前会话；
- 操作滚动容器；
- 点击加载更多；
- 展开折叠内容；
- 捕获虚拟列表中短暂出现的节点；
- 对未知页面进行捕获校准；
- 加载和验证 Capture Profile；
- 展示捕获预览；
- 向 CLI 分批传输数据；
- 显示捕获进度和结果。

扩展不负责：

- 任意读写本地目录；
- 管理仓库结构；
- 直接执行 Shell 命令；
- 自行修改 Git 仓库；
- 直接决定最终数据落盘路径；
- 长期维护全文索引。

## 10.3 Uplink Bridge

Bridge 由 CLI 提供，通过 Chrome Native Messaging 与扩展通信。

负责：

- 验证扩展来源；
- 接收类型化请求；
- 校验 JSON Schema；
- 控制数据块大小；
- 管理捕获事务；
- 将数据写入 staging；
- 返回小型确认消息；
- 拒绝不在白名单中的操作；
- 防止路径穿越和任意命令执行。

## 10.4 Uplink Archive

Uplink Archive 是本地文件系统仓库。

应满足：

- 可被用户直接查看；
- 不依赖专用数据库才能读取原始数据；
- 原始数据与派生数据分离；
- 可迁移；
- 可备份；
- 可重新解析；
- 可审计；
- 支持未来格式升级。

---

# 11. 单仓库绑定机制

## 11.1 基本规则

每台设备只支持一个已绑定仓库。

首次执行：

```bash
uplink init
```

时，将当前命令执行目录设为仓库，并保存到用户级配置。

## 11.2 用户级配置位置

建议遵循各平台规范：

```text
Windows:
%APPDATA%\Uplink\config.json

macOS:
~/Library/Application Support/Uplink/config.json

Linux:
~/.config/uplink/config.json
```

配置示例：

```json
{
  "schemaVersion": 1,
  "repositoryPath": "/Users/example/agent-archive",
  "repositoryId": "repo_01J...",
  "boundAt": "2026-07-18T12:00:00Z"
}
```

## 11.3 仓库重新绑定

不提供多仓库列表和日常切换命令。

更换仓库需要显式操作：

```bash
uplink rebind /path/to/repository
```

重新绑定前必须：

1. 验证目标仓库有效；
2. 显示当前仓库和目标仓库；
3. 要求用户明确确认；
4. 不自动迁移旧仓库数据；
5. 更新 Native Messaging Bridge 所使用的仓库位置。

## 11.4 仓库失效处理

仓库路径不存在或不可读时，CLI 应停止写操作并提示：

- 原绑定路径；
- 可能原因；
- 使用 `uplink rebind` 恢复；
- 使用 `uplink doctor` 诊断。

不得自动在其他路径创建新仓库。

---

# 12. CLI 命令设计

## 12.1 仓库命令

```bash
uplink init
uplink status
uplink verify
uplink doctor
uplink rebind <path>
```

### `uplink init`

- 只能在目标仓库目录中执行；
- 当前目录非空时检查冲突；
- 创建仓库结构；
- 写入仓库配置；
- 绑定设备。

### `uplink status`

显示：

- 仓库路径；
- 仓库 ID；
- 数据格式版本；
- 已导入平台；
- 会话数量；
- 消息数量；
- 附件数量；
- 最近导入；
- 最近捕获；
- Bridge 状态；
- 索引状态；
- 仓库锁状态。

### `uplink verify`

检查：

- 配置文件；
- 目录结构；
- 文件哈希；
- 消息引用；
- 附件引用；
- 捕获事务；
- 重复消息；
- 索引一致性。

### `uplink doctor`

检查：

- Node.js 运行环境；
- 全局 CLI 路径；
- 仓库读写权限；
- Native Messaging Host；
- Chrome 扩展连接；
- 解析器版本；
- 未完成事务；
- 损坏文件；
- 失效 Capture Profile。

## 12.2 数据导入命令

```bash
uplink ingest
uplink import chatgpt <file>
uplink import gemini <file>
```

### `uplink ingest`

扫描仓库的 `inbox/`，自动识别支持的导出包。

处理成功后，原始投递文件可以：

- 默认保留在 `inbox/processed/`；
- 或由配置决定移动到已处理目录；
- 不得在没有明确配置时直接删除。

### `uplink import`

接收用户明确指定的导出文件。

导入前计算文件哈希，避免重复导入相同文件。

## 12.3 Bridge 命令

```bash
uplink bridge install
uplink bridge status
uplink bridge doctor
uplink bridge uninstall
```

### `bridge install`

负责：

- 创建稳定 Native Host 启动器；
- 注册 Native Messaging Host；
- 写入正式扩展 ID；
- 检查 Chrome 安装位置；
- 验证启动器可执行；
- 完成一次握手测试。

不建议通过 npm `postinstall` 静默注册系统配置。

## 12.4 数据管理命令

```bash
uplink list conversations
uplink show <conversation-id>
uplink reindex
uplink dedupe
uplink captures
uplink capture show <capture-id>
uplink capture discard <capture-id>
```

## 12.5 主题归集命令

```bash
uplink context build <topic>
uplink context update <context-id>
uplink context show <context-id>
uplink context export <context-id>
```

主题归集属于后续阶段，但仓库结构应从第一阶段预留。

---

# 13. 官方导出数据导入流程

## 13.1 处理状态机

```text
发现文件
  ↓
识别平台和格式
  ↓
计算源文件哈希
  ↓
检查是否已导入
  ↓
建立导入事务
  ↓
复制原始导出包
  ↓
安全解压
  ↓
保存原始解包文件
  ↓
调用平台解析器
  ↓
生成标准化消息
  ↓
处理附件
  ↓
去重与校验
  ↓
更新索引
  ↓
提交事务
  ↓
生成导入报告
```

## 13.2 安全解压要求

必须防止：

- Zip Slip 路径穿越；
- 超大解压炸弹；
- 异常文件数量；
- 符号链接逃逸；
- 文件名编码异常；
- 覆盖已有原始数据。

应配置：

- 最大压缩包大小；
- 最大解压后大小；
- 最大文件数量；
- 单文件最大大小；
- 允许的解压目标目录。

## 13.3 重复导入

同一个源文件通过 SHA-256 识别。

如果用户重复导入：

- 默认提示已导入；
- 不重复生成原始副本；
- 可以通过显式参数重新解析；
- 重新解析结果应生成新的处理版本，但引用同一原始源。

---

# 14. Chrome 捕获机制

## 14.1 捕获策略优先级

```text
平台正式适配器
    ↓ 不可用
历史 Capture Profile
    ↓ 验证失败
自动校准
    ↓ 低置信度
用户点击确认
```

## 14.2 页面按需加载

扩展需要主动操作页面：

- 向上滚动；
- 点击“加载更多”；
- 点击“查看更早消息”；
- 展开“显示更多”；
- 等待加载动画结束；
- 监听 DOM 变化；
- 检查滚动高度变化；
- 检查最旧消息变化。

不得只依赖固定的 `sleep`。

## 14.3 虚拟列表

虚拟列表只保留当前视口附近的少量 DOM 节点。

因此扩展必须：

```text
读取当前可见消息
  ↓
计算临时指纹并保存
  ↓
向上滚动
  ↓
等待新消息节点
  ↓
继续提取
```

不能在滚动完成后一次性读取最终 DOM。

## 14.4 捕获结束条件

可组合以下条件：

- 已到达滚动顶部；
- 页面明确显示第一条消息；
- 连续三轮没有发现新消息；
- 最旧消息指纹不再变化；
- 滚动高度不再变化；
- 没有正在进行的历史加载请求；
- 平台适配器判断已到开头。

结束时应标记完整性状态：

```text
complete
probably_complete
partial
failed
```

## 14.5 分支和重新生成回答

平台存在分支会话时，标准化模型需要预留：

- `parentMessageId`
- `branchId`
- `activeBranch`
- `alternativeIndex`

第一阶段至少保存当前可见分支。

是否自动遍历所有分支作为后续能力，不作为首版强制要求。

---

# 15. 捕获校准功能

## 15.1 输入

用户提供：

- 用户第一条消息的前若干连续字符；
- Agent 第一条回答的前若干连续字符。

建议提示输入 15～30 个相对独特字符。

## 15.2 文本标准化

匹配前应：

- 去除首尾空格；
- 合并连续空白；
- 统一换行；
- Unicode 标准化；
- 对部分 Markdown 展示差异进行兼容；
- 支持被多个 DOM 节点拆分的连续文本。

## 15.3 节点分析

找到文本后向上遍历：

```text
文本节点
  ↓
正文节点
  ↓
消息节点
  ↓
消息列表
  ↓
会话根节点
  ↓
滚动容器
```

系统分析：

- 标签；
- 稳定属性；
- ARIA 角色；
- 子节点结构；
- 同级节点重复率；
- 文本密度；
- 左右布局；
- 头像与角色标签；
- 消息排列规律。

## 15.4 自动验证

生成规则后需要提取当前页面所有候选消息，并验证：

- 锚点是否正确命中；
- 两个锚点角色是否正确；
- 消息数量是否合理；
- 是否误识别侧边栏；
- 是否误识别输入框；
- 消息是否大量重复；
- 角色排列是否合理；
- 滚动后规则是否继续有效。

## 15.5 用户确认

扩展展示：

- 识别的消息数量；
- 用户消息数量；
- Agent 消息数量；
- 未识别消息数量；
- 第一条和最后一条消息预览；
- 捕获区域高亮；
- 置信度；
- 风险提示。

用户确认后保存配置。

## 15.6 点击校准

当文本不唯一或无法匹配时，支持：

1. 点击选择用户消息；
2. 点击选择 Agent 消息；
3. 自动推断公共结构；
4. 生成预览；
5. 用户确认。

## 15.7 Capture Profile

校准结果保存为声明式配置，不保存或执行任意网页 JavaScript。

示例：

```json
{
  "profileVersion": 1,
  "origin": "https://example.com",
  "urlPattern": "/chat/*",
  "scrollContainer": {
    "selector": "main [data-scroll-container]",
    "direction": "older-up"
  },
  "messageItem": {
    "selector": "[data-message-id]"
  },
  "content": {
    "relativeSelector": ".markdown-body"
  },
  "roleRules": [
    {
      "role": "user",
      "attribute": "data-author",
      "equals": "user"
    },
    {
      "role": "assistant",
      "attribute": "data-author",
      "equals": "assistant"
    }
  ],
  "expandRules": [
    {
      "matchText": "显示更多",
      "action": "click"
    }
  ],
  "confidence": 0.92,
  "calibratedAt": "2026-07-18T12:00:00Z"
}
```

## 15.8 Profile 失效检测

每次使用前检查：

- 选择器是否存在；
- 消息命中率；
- 角色规则命中率；
- 是否出现大量未知节点；
- 页面结构指纹是否明显变化。

失效时不得静默保存错误数据，应提示重新校准。

---

# 16. 扩展与 CLI 通信

## 16.1 通信方式

正式版本默认使用 Chrome Native Messaging。

开发环境可提供受限的 localhost 调试模式，但不作为正式默认方案。

## 16.2 容量设计

Native Messaging 从扩展发送到本地 Host 的单条消息容量足以承载普通长会话。

上万字纯文本通常仅为几十 KB，不构成容量问题。

但工程实现仍应分批传输，而不是把整场会话作为一个巨大消息发送。

建议：

- 每批 256 KiB～1 MiB；
- 每批包含若干条完整消息；
- 不在消息中间强行切断文本，除非单条消息过大；
- 每批携带顺序号和哈希；
- Bridge 返回小型确认消息。

## 16.3 捕获事务协议

```text
capture.begin
capture.append
capture.commit
capture.abort
```

### `capture.begin`

创建捕获事务，返回 `captureId`。

### `capture.append`

分批追加：

```json
{
  "type": "capture.append",
  "captureId": "cap_01J...",
  "sequence": 3,
  "payload": {
    "messages": []
  },
  "sha256": "..."
}
```

### `capture.commit`

CLI 检查：

- 数据块是否连续；
- 是否缺块；
- 哈希是否一致；
- 消息是否可解析；
- 是否存在重复；
- 仓库是否可写。

检查通过后进行原子提交。

### `capture.abort`

终止捕获，保留或清理 staging 数据。

## 16.4 断点续传

Bridge 应记录已接受的最大序号。

扩展重新连接后可以查询：

```text
capture.status
```

并从最后确认的数据块继续。

---

# 17. Bridge 安全边界

扩展只能调用固定领域操作：

```text
repo.status
profile.load
profile.save
capture.begin
capture.append
capture.status
capture.commit
capture.abort
attachment.begin
attachment.append
attachment.commit
```

禁止提供：

- 任意 Shell 命令；
- 任意文件路径写入；
- 任意文件删除；
- 任意 Git 操作；
- 任意网络代理；
- 仓库外目录访问。

Bridge 对扩展数据进行二次验证：

- JSON Schema；
- 消息类型；
- 字段长度；
- 批次大小；
- 平台枚举；
- 请求顺序；
- 哈希；
- 捕获事务状态；
- 仓库路径；
- 路径穿越；
- 附件类型；
- 请求频率。

网页 DOM 和 Content Script 均视为不可信数据来源。

---

# 18. 仓库目录结构

```text
uplink-repository/
├── uplink.json
├── inbox/
│   ├── processed/
│   └── failed/
│
├── raw/
│   ├── chatgpt/
│   ├── gemini/
│   ├── doubao/
│   └── yuanbao/
│
├── conversations/
│   ├── chatgpt/
│   ├── gemini/
│   ├── doubao/
│   └── yuanbao/
│
├── attachments/
│   └── sha256/
│
├── imports/
├── captures/
│   ├── staging/
│   └── completed/
│
├── profiles/
├── indexes/
│   ├── messages/
│   └── topics/
│
├── contexts/
├── logs/
└── migrations/
```

## 18.1 `uplink.json`

仓库配置示例：

```json
{
  "repositoryVersion": 1,
  "repositoryId": "repo_01J...",
  "createdAt": "2026-07-18T12:00:00Z",
  "schemaVersion": 1
}
```

不建议在仓库配置中保存设备绝对路径。

## 18.2 `raw/`

保存原始数据。

官方导入示例：

```text
raw/chatgpt/<import-id>/
├── manifest.json
├── source.zip
└── expanded/
```

网页捕获示例：

```text
raw/doubao/<capture-id>/
├── manifest.json
├── page.json
├── messages.jsonl
└── html/
```

## 18.3 `conversations/`

保存统一格式的标准化会话。

建议每个会话一个 JSONL 文件，便于增量追加和流式处理：

```text
conversations/chatgpt/<conversation-id>.jsonl
```

## 18.4 `attachments/`

附件按内容哈希去重：

```text
attachments/sha256/ab/cd/<full-hash>
```

元数据记录原文件名、MIME 类型、来源平台和关联消息。

## 18.5 `imports/`

保存每次官方导入的报告和状态。

## 18.6 `captures/`

保存每次网页捕获过程和结果。

## 18.7 `profiles/`

保存平台正式适配器之外的 Capture Profile。

## 18.8 `contexts/`

保存主题背景包及证据映射。

---

# 19. 标准化数据模型

## 19.1 会话

```ts
interface Conversation {
  schemaVersion: number;
  platform: string;
  conversationId: string;
  title?: string;

  createdAt?: string;
  updatedAt?: string;
  capturedAt: string;

  sourceUrl?: string;
  accountId?: string;

  activeBranchId?: string;
  messageCount: number;

  sourceRefs: SourceReference[];
}
```

## 19.2 消息

```ts
interface ArchivedMessage {
  schemaVersion: number;

  platform: string;
  conversationId: string;
  messageId: string;

  parentMessageId?: string;
  branchId?: string;

  role: "user" | "assistant" | "system" | "tool" | "unknown";

  content: ContentBlock[];

  createdAt?: string;
  capturedAt: string;
  sequence: number;

  sourceUrl?: string;
  sourceImportId?: string;
  sourceCaptureId?: string;

  rawRef?: string;
  contentHash: string;
  adapterVersion: string;
}
```

## 19.3 内容块

```ts
type ContentBlock =
  | { type: "text"; text: string }
  | { type: "markdown"; markdown: string }
  | { type: "code"; language?: string; code: string }
  | { type: "image"; attachmentHash: string }
  | { type: "file"; attachmentHash: string }
  | { type: "citation"; label?: string; url?: string }
  | { type: "unknown"; raw: unknown };
```

## 19.4 来源引用

```ts
interface SourceReference {
  type: "import" | "capture";
  id: string;
  rawPath: string;
  parserVersion?: string;
  profileVersion?: number;
}
```

---

# 20. 消息标识与去重

平台提供稳定消息 ID 时优先使用平台 ID。

平台没有消息 ID 时，可生成：

```text
platform
+ conversationId
+ role
+ normalizedContent
+ approximatePosition
```

的哈希作为本地消息 ID。

去重不能只依赖文本，因为：

- 用户可能重复发送相同内容；
- Agent 可能生成相同开头；
- 重新生成回答可能高度相似；
- 不同分支可能包含相同消息。

应综合：

- 平台消息 ID；
- 父消息 ID；
- 角色；
- 内容哈希；
- 时间；
- 顺序；
- 分支信息；
- 来源捕获批次。

---

# 21. staging 与原子提交

浏览器捕获数据首先写入：

```text
captures/staging/<capture-id>/
```

示例：

```text
manifest.json
chunk-000001.json
chunk-000002.json
attachments/
```

提交时执行：

1. 获取仓库写锁；
2. 验证事务状态；
3. 验证所有数据块；
4. 验证哈希；
5. 合并消息；
6. 去重；
7. 保存原始捕获数据；
8. 更新标准化会话；
9. 更新附件引用；
10. 更新索引；
11. 写入捕获报告；
12. 原子移动至 completed；
13. 释放仓库锁。

任何步骤失败，不得留下部分正式数据。

---

# 22. 审计和日志

每次导入和捕获都应生成报告。

至少包含：

- 操作 ID；
- 平台；
- 开始和结束时间；
- 源文件或页面；
- 原始数据哈希；
- 解析器或 Profile 版本；
- 发现会话数；
- 发现消息数；
- 新增消息数；
- 重复消息数；
- 未识别消息数；
- 附件数；
- 警告；
- 错误；
- 完整性状态；
- 最终写入路径。

日志不应默认复制完整敏感会话正文。

---

# 23. 主题归集与背景包

主题归集的目的不是生成无法验证的长期总结，而是：

> 从多个 Agent 和多个会话中提取与指定主题相关的原始片段，形成带证据和时间信息的新背景资料。

建议目录：

```text
contexts/<context-id>/
├── manifest.json
├── background.md
├── evidence.jsonl
├── conflicts.json
└── timeline.json
```

## 23.1 `background.md`

面向用户和 Agent 阅读的背景资料。

## 23.2 `evidence.jsonl`

每个结论映射到原始消息：

```json
{
  "claimId": "claim-001",
  "platform": "chatgpt",
  "conversationId": "conv-123",
  "messageId": "msg-456",
  "excerpt": "……",
  "createdAt": "2026-06-01T00:00:00Z"
}
```

## 23.3 `conflicts.json`

记录：

- 不同时间的观点变化；
- 不同 Agent 得出的冲突结论；
- 事实冲突；
- 尚未验证的信息。

## 23.4 背景包导出

支持：

```bash
uplink context export <context-id> --format markdown
uplink context export <context-id> --format json
```

未来可扩展为直接复制到剪贴板或发送给指定 Agent。

---

# 24. 隐私与权限

## 24.1 Chrome 权限最小化

扩展应优先使用：

- `activeTab`
- `scripting`
- `storage`
- `nativeMessaging`

平台域名权限尽量按需申请，而不是默认请求所有网站访问权。

## 24.2 本地数据

- 默认不上传；
- 不默认启用遥测；
- 崩溃报告不得包含会话正文；
- Capture Profile 可单独导出，但不得默认包含用户输入锚点全文；
- 敏感日志应支持关闭或脱敏。

## 24.3 扩展来源限制

Native Host 的 `allowed_origins` 只允许正式扩展 ID和明确配置的开发扩展 ID。

---

# 25. 技术实现建议

## 25.1 Monorepo

建议使用 TypeScript Monorepo：

```text
packages/
├── cli/
├── core/
├── schemas/
├── repository/
├── import-chatgpt/
├── import-gemini/
├── bridge/
├── capture-engine/
└── extension/
```

共享：

- 数据类型；
- JSON Schema；
- 哈希规则；
- 错误码；
- 仓库操作；
- 平台枚举；
- 版本迁移能力。

## 25.2 CLI

建议使用：

- Node.js；
- TypeScript；
- Commander.js 或 Clipanion；
- Zod 或 JSON Schema；
- 流式文件处理；
- 原子文件写入；
- 跨平台路径处理。

## 25.3 Chrome 扩展

建议：

- Manifest V3；
- TypeScript；
- Content Script；
- Service Worker；
- Side Panel 或 Popup；
- `MutationObserver`；
- 声明式 Capture Profile；
- 平台适配器接口。

## 25.4 平台适配器接口

```ts
interface PlatformAdapter {
  id: string;
  version: string;

  match(url: URL): boolean;

  getConversationMetadata(): Promise<ConversationMetadata>;

  getVisibleMessages(): Promise<ExtractedMessage[]>;

  expandCollapsedContent(): Promise<void>;

  loadOlderMessages(): Promise<LoadResult>;

  hasReachedBeginning(): Promise<boolean>;

  validate(): Promise<AdapterValidation>;
}
```

## 25.5 索引

第一阶段可以采用：

- 结构化 JSONL；
- SQLite 或轻量倒排索引作为派生索引；
- 原始文件仍作为事实来源。

后续再增加：

- BM25；
- 向量检索；
- 混合检索；
- 本地嵌入模型。

索引必须可删除并重建，不得成为唯一数据来源。

---

# 26. 错误处理

应定义统一错误码，例如：

```text
REPOSITORY_NOT_BOUND
REPOSITORY_NOT_FOUND
REPOSITORY_LOCKED
INVALID_REPOSITORY
IMPORT_FORMAT_UNSUPPORTED
IMPORT_ALREADY_EXISTS
ARCHIVE_EXTRACTION_FAILED
BRIDGE_NOT_INSTALLED
BRIDGE_CONNECTION_FAILED
PROFILE_INVALID
PROFILE_OUTDATED
CAPTURE_INCOMPLETE
CAPTURE_CHUNK_MISSING
CAPTURE_HASH_MISMATCH
MESSAGE_PARSE_FAILED
ATTACHMENT_TOO_LARGE
```

错误信息应包含：

- 发生了什么；
- 是否写入了正式仓库；
- 可以执行的修复命令；
- 对应操作 ID。

---

# 27. 首版验收标准

## 27.1 CLI

- 可以通过 npm 全局安装；
- `uplink init` 能初始化当前目录；
- 当前设备只能绑定一个仓库；
- 可在其他目录调用命令操作绑定仓库；
- 仓库丢失时不会自动创建新仓库；
- `status`、`verify`、`doctor` 可用。

## 27.2 ChatGPT 导入

- 能识别支持版本的官方导出包；
- 保存原始 ZIP；
- 保存解包文件；
- 转换为统一消息格式；
- 重复导入不会产生重复消息；
- 生成导入报告。

## 27.3 Gemini 导入

- 能识别支持版本的官方导出数据；
- 保留原始数据；
- 转换为统一格式；
- 生成导入报告。

## 27.4 Chrome 扩展

- 能连接本地 Bridge；
- 能显示当前仓库路径；
- 能捕获至少一个正式支持平台；
- 能处理向上懒加载；
- 能在虚拟列表滚动过程中持续保存消息；
- 能分批向 CLI 传输长会话；
- 传输中断后不会写入不完整正式数据。

## 27.5 捕获校准

- 支持输入两段锚点；
- 能高亮匹配结果；
- 能推断消息节点；
- 能展示捕获预览；
- 支持点击校准；
- 能保存 Capture Profile；
- Profile 失效时能阻止错误采集。

## 27.6 数据完整性

- 每条标准化消息包含来源引用；
- 原始数据与标准化数据分开；
- 附件支持哈希去重；
- 捕获和导入过程可审计；
- `uplink verify` 能发现缺失和损坏。

---

# 28. 建议开发阶段

## Phase 0：核心模型验证

- 定义仓库结构；
- 定义标准化会话 Schema；
- 定义导入和捕获事务；
- 定义 Bridge 协议；
- 编写样例数据和 Golden Tests。

## Phase 1：CLI 与仓库

- npm 全局安装；
- `init`；
- 单仓库绑定；
- `status`；
- `verify`；
- `doctor`；
- 原子写入；
- 哈希和日志。

## Phase 2：官方导入

- ChatGPT 导入器；
- Gemini 导入器；
- `inbox` 扫描；
- 安全解压；
- 附件处理；
- 重复导入处理。

## Phase 3：Bridge 和扩展最小版本

- Native Messaging；
- Bridge 安装和诊断；
- 当前可见消息捕获；
- 分块传输；
- staging；
- 捕获报告。

## Phase 4：完整会话捕获

- 自动向上滚动；
- 懒加载检测；
- 虚拟列表处理；
- 折叠内容展开；
- 豆包适配器；
- 腾讯元宝适配器；
- 断点续传。

## Phase 5：捕获校准

- 文本锚点；
- DOM 结构推断；
- 点击校准；
- Capture Profile；
- 置信度和失效检测。

## Phase 6：检索与主题归集

- 全文索引；
- 跨平台检索；
- 主题背景包；
- 证据引用；
- 冲突和时间线；
- Markdown/JSON 导出。

---

# 29. 风险与应对

## 29.1 平台网页改版

应对：

- 正式适配器版本化；
- Capture Profile 结构指纹；
- 捕获前验证；
- 低置信度阻断；
- 保存适配器版本。

## 29.2 虚拟列表漏采

应对：

- 滚动过程中增量提取；
- 多轮无新增判断；
- 消息指纹去重；
- 捕获报告记录完整性；
- 用户可查看首尾消息预览。

## 29.3 Native Messaging 安装复杂

应对：

- `uplink bridge install` 自动完成注册；
- 使用稳定启动器；
- 提供 `bridge doctor`；
- 支持 Windows、macOS、Linux 分平台实现。

## 29.4 npm 与 Node 路径变化

应对：

- Native Host 清单指向稳定启动器；
- 启动器动态定位当前 CLI；
- 升级后运行连接自检。

## 29.5 数据格式升级

应对：

- 所有文件带 Schema 版本；
- 原始数据不变；
- 迁移只处理派生数据；
- 迁移前生成报告；
- 索引可重建。

## 29.6 捕获错误内容

应对：

- 校准预览；
- 置信度；
- 页面区域高亮；
- 消息数量和角色统计；
- 正式提交前校验；
- 支持丢弃捕获事务。

---

# 30. 项目一句话描述

> Uplink 是一个本地优先的多 Agent 会话归档系统，通过官方数据导出与浏览器捕获，将分散在不同 Agent 平台中的个人会话汇聚到用户自己的本地仓库，并为跨 Agent 检索、主题归集和背景信息生成提供统一、可追溯的数据基础。
