<p align="right">
  <a href="README_EN.md">🇬🇧 English</a>
</p>

<h1 align="center">
  <img src="extension/icons/logo.png" width="64" height="64" alt="logo"><br>
  115 离线助手
</h1>

<p align="center">
  <strong>自动检测 magnet/ed2k 链接，一键推送到 115 网盘离线下载。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue" alt="Manifest V3">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/version-1.0.0-orange" alt="Version">
</p>

---

## ✨ 功能特性

- 🔍 **自动检测链接** — 自动检测任意网页上的 magnet 和 ed2k 链接（可选开启）
- 📋 **剪贴板支持** — 在弹出窗口直接粘贴链接推送
- 📥 **一键推送** — 即时推送链接到 115 网盘离线下载队列
- 📁 **自定义保存路径** — 选择离线下载的保存目录
- 🗑️ **自动删除小文件** — 自动删除低于指定大小的文件（如广告文件）
- 📂 **自动整理视频** — 自动将视频文件按名称归类到文件夹
- 📱 **扫码登录** — 在扩展弹窗中直接扫码登录 115 账号
- 🌐 **中英双语** — 界面支持中文和英文

## 📦 安装方法

### Chrome 应用商店（推荐）

直接从 Chrome 应用商店安装：

[<img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png" height="58" alt="前往 Chrome 应用商店">](https://chromewebstore.google.com/detail/115-offline-helper/blgnjjjbmjgilkiimglodjdebcdaidgl?hl=zh-CN&authuser=0)

### 手动安装

1. **下载扩展**

   前往 [Releases](https://github.com/gangz1o/115-offline-helper/releases/latest) 页面，下载 `115-offline-helper_v*.zip` 并解压。

   或通过 Git 克隆仓库：

   ```bash
   git clone https://github.com/gangz1o/115-offline-helper.git
   ```

2. **打开扩展管理页面**

   | 浏览器 | 地址 |
   |--------|------|
   | Chrome | `chrome://extensions/` |
   | Edge | `edge://extensions/` |

3. **开启开发者模式**

   打开页面左下角（Edge）或右上角（Chrome）的 **开发者模式** 开关。

4. **加载扩展**

   点击 **加载已解压的扩展程序**，选择项目中的 `extension` 文件夹。

5. **完成！**

   扩展图标会出现在工具栏中，建议点击 📌 固定方便使用。

> **💡 提示：** 更新时运行 `git pull` 拉取最新代码，然后在扩展管理页面点击 ↻ 刷新按钮即可。

> **💡 兼容性：** 本扩展基于 Manifest V3，支持所有 Chromium 内核浏览器（Chrome、Edge、Brave、Arc 等）。

## 🚀 使用说明

1. **登录** — 点击扩展图标 → **扫码登录** → 用 115 手机客户端扫描二维码。❗️❗️❗️强烈建议使用非常用客户端（如小程序端），这样不会将常用客户端挤掉线
2. **设置保存目录** — 在主页下拉框中选择，或在设置页添加自定义路径（格式：`文件夹名:CID`）。
3. **推送链接** — 两种方式：
   - **弹窗推送**：在输入框中粘贴 magnet/ed2k 链接，点击 **推送**。
   - **自动检测**：在设置中开启"自动检测链接"，浏览任意网页时自动检测并弹出一键推送确认框。

### 设置项

| 设置 | 说明 |
|------|------|
| 保存目录列表 | 按 `目录名:CID` 格式添加，每行一个 |
| 自动检测链接 | 通过内容脚本在所有页面检测链接 |
| 自动删除小文件 | 删除小于指定 MB 的文件 |
| 自动整理视频文件 | 将视频文件按文件名归类到文件夹 |

## ❓ 常见问题

**Q: 如何获取文件夹 CID？**
> 在 [115.com](https://115.com) 网页版打开目标文件夹，查看地址栏：`https://115.com/?cid=1234567`，`cid=` 后面的数字就是 CID。

**Q: 提示未登录？**
> 点击扩展图标 → **扫码登录**，用 115 手机客户端扫码即可。❗️❗️❗️强烈建议使用非常用客户端（如小程序端），这样不会将常用客户端挤掉线

**Q: 自动检测不生效？**
> 确保在设置中开启了"自动检测链接"。浏览器会请求额外权限，请点击允许。

## 🔒 隐私

- 所有数据通过 `chrome.storage.local` 保存在本地
- 不收集、传输或共享任何用户数据
- 仅与 `*.115.com` 域名通信
- [完整隐私政策](https://gangz1o.github.io/115-offline-helper/privacy-policy.html)

## 📄 License

[MIT License](LICENSE)
