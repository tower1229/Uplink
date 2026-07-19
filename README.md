# Uplink

Uplink 是一个本地优先的个人 Conversation Repository。当前 CLI 支持初始化并绑定本机唯一的 Repository、从任意工作目录查看其基础健康状态，以及显式重新绑定已有 Repository。

## Monorepo 结构

```text
apps/
  cli/                    # 可全局安装的 uplink CLI
packages/
  repository/             # Binding 与 Repository 持久化边界
tests/                    # 跨 workspace 的 CLI/Repository 验收测试
```

后续的 Extension、Bridge、Schemas、Import Adapter 和 Capture Engine 按运行时与模块边界加入 `apps/*` 或 `packages/*`，根包只负责 workspace 编排，不发布。

## 开发

```powershell
npm.cmd install
npm.cmd run check
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

## 安装与使用

```powershell
npm.cmd run pack:cli
npm.cmd install --global .\tower1229-uplink-0.1.0.tgz

mkdir my-uplink-repository
cd my-uplink-repository
uplink init

cd ..
uplink status
uplink status --json

# 先查看当前 Binding，再明确确认切换；不会迁移任何 Repository 数据
uplink rebind C:\path\to\another-repository
uplink rebind C:\path\to\another-repository --yes
```

`uplink init` 首次运行时会创建版本化 `uplink.json`、Inbox 和 v1 Repository 布局，并将本设备绑定到该 Repository。重复在同一 Repository 运行不会改变 Repository id；若设备已绑定到其他路径，命令会拒绝覆盖现有 Binding。

`uplink rebind <path>` 只接受已有且配置有效的 Repository。未带 `--yes` 时命令会显示当前路径、目标路径和“不迁移数据”的提醒，并保持原 Binding；核对后使用 `--yes` 才会原子更新设备 Binding。

测试和自动化可以通过 `UPLINK_CONFIG_DIR` 隔离设备 Binding。正常使用时，Windows 写入 `%APPDATA%\Uplink`，macOS/Linux 写入 `$XDG_CONFIG_HOME/uplink` 或 `~/.config/uplink`。
