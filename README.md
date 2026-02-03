<img width="968" height="544" alt="image" src="https://github.com/user-attachments/assets/c95db93f-c6e3-48eb-8d8b-b00f892bbd46" /># 98tang (sehuatang) 磁力/ED2K 推送到 115 网盘

一个油猴脚本，用于在 sehuatang.net/sehuatang.org 网站上自动检测复制的 magnet/ed2k 链接，一键推送到 115 网盘离线下载。
![B1IYgLhgviZVBR5VVLAOrnx55n3SZsAm.webp](https://cdn.nodeimage.com/i/B1IYgLhgviZVBR5VVLAOrnx55n3SZsAm.webp)
![4bEdfGi4myr8iprvMqKGcYrLcyEantgq.webp](https://cdn.nodeimage.com/i/4bEdfGi4myr8iprvMqKGcYrLcyEantgq.webp)
![6x33mGC0tL0NWKqOuul7b2XxLuQk6rmD.webp](https://cdn.nodeimage.com/i/6x33mGC0tL0NWKqOuul7b2XxLuQk6rmD.webp)
![pv8AJ9w4mFuh2pPQKs2s5LGWY8RI59YO.webp](https://cdn.nodeimage.com/i/pv8AJ9w4mFuh2pPQKs2s5LGWY8RI59YO.webp)
![VcMp84uupRq2VWpSi2pMGy1ZAldIXewi.webp](https://cdn.nodeimage.com/i/VcMp84uupRq2VWpSi2pMGy1ZAldIXewi.webp)


## 功能特性

- 🔍 **自动检测链接**：监听复制事件，自动识别 magnet 和 ed2k 链接
- 📥 **一键推送**：弹出确认对话框，一键推送到 115 网盘离线下载
- 📁 **自定义保存路径**：支持设置离线下载的保存目录
- ✏️ **自动重命名**：支持离线完成后自动重命名文件
- 🗑️ **自动清理小文件**：自动删除低于指定大小的文件（如广告文件）
- 💾 **配置持久化**：所有设置自动保存，下次打开自动恢复

## 安装方法

### 一键安装（推荐）

- **[Greasy Fork 安装脚本](https://greasyfork.org/zh-CN/scripts/565030-98tang-sehuatang-%E7%A3%81%E5%8A%9B-ed2k-%E6%8E%A8%E9%80%81%E5%88%B0-115-%E7%BD%91%E7%9B%98)** — 点击即可安装/更新

### 前置要求

1. 安装 Tampermonkey 浏览器扩展
   - [Chrome 版本](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox 版本](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Edge 版本](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. 确保已登录 115 网盘（在 [115.com](https://115.com) 登录）

### 手动安装脚本

1. 打开 Tampermonkey 管理面板
2. 点击「添加新脚本」
3. 将 `sehuatang-to-115.user.js` 的内容复制粘贴到编辑器中
4. 点击「保存」

或者直接点击本仓库中的 `.user.js` 文件，Tampermonkey 会自动提示安装。

## 使用说明

### 配置面板

访问 sehuatang.net 网站后，右下角会出现配置面板：

1. **离线保存路径 ID**：输入 115 网盘文件夹的 CID
   - `0` 表示根目录
   - 获取 CID 方法：在 115 网盘打开目标文件夹，URL 中 `cid=` 后面的数字就是 CID
   - 例如：`https://115.com/?cid=1234567` 中的 `1234567`

2. **离线保存路径名称**：仅用于显示，方便你记住保存位置

3. **离线后自动重命名**：
   - 启用后可设置重命名模板
   - `{name}` 会被替换为原文件名
   - 例如：`[98tang]{name}` 会把文件 `movie.mp4` 重命名为 `[98tang]movie.mp4`

4. **自动删除小文件**：
   - 启用后可设置大小阈值（单位 MB）
   - 离线完成后自动删除小于该大小的文件
   - 适用于清理种子中的广告文件

### 推送链接

1. 在 sehuatang 页面复制包含 magnet 或 ed2k 链接的文本
2. 脚本会自动弹出确认对话框
3. 点击「确定推送」将链接发送到 115 网盘离线下载
4. 推送成功后会显示通知

### 最小化面板

- 点击面板标题栏的「−」按钮可以最小化面板
- 点击最小化后的图标可以恢复面板

## 常见问题

### Q: 提示「未登录 115 网盘」？

A: 请先访问 [115.com](https://115.com) 登录你的账号，然后刷新 sehuatang 页面重试。

### Q: 如何获取文件夹 CID？

A: 在 115 网盘网页版打开目标文件夹，查看浏览器地址栏，`cid=` 后面的数字就是 CID。

### Q: 自动删除小文件不生效？

A: 自动删除功能需要等待离线任务完成后才会执行。如果任务下载时间较长，可能需要等待几分钟。

### Q: 支持哪些链接格式？

A: 支持以下格式：
- Magnet 链接：`magnet:?xt=urn:btih:...`
- ED2K 链接：`ed2k://|file|...`

## 技术说明

### 使用的 115 API 端点

- 登录状态检查：`https://my.115.com/?ct=guide&ac=status`
- 获取用户 UID：`https://my.115.com/?ct=ajax&ac=get_user_aq`
- 获取 Sign/Time：`https://115.com/?ct=offline&ac=space`
- 添加离线任务：`https://115.com/web/lixian/?ct=lixian&ac=add_task_url`
- 获取任务列表：`https://115.com/web/lixian/?ct=lixian&ac=task_lists`
- 获取文件列表：`https://webapi.115.com/files`
- 删除文件：`https://webapi.115.com/rb/delete`
- 重命名文件：`https://webapi.115.com/files/edit`

### 权限说明

脚本需要以下 Tampermonkey 权限：
- `GM_xmlhttpRequest`：用于跨域请求 115 API
- `GM_setValue/GM_getValue`：用于保存配置
- `GM_notification`：用于显示系统通知
- `GM_addStyle`：用于添加自定义样式

## 免责声明

本脚本仅供学习交流使用，请遵守相关法律法规和网站使用条款。使用本脚本产生的任何问题由使用者自行承担。

## License

MIT License
