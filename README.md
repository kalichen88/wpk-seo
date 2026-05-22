# 企业宣传站（静态版）+ Cloudflare Pages/Workers

## 1. 本地预览
本项目使用 ES Module 脚本，建议通过本地 HTTP 服务预览（直接双击打开 `index.html` 可能会因浏览器安全策略导致脚本无法加载）。

可选方式：
- VS Code 安装 Live Server 扩展，右键 `index.html` → Open with Live Server
- PowerShell 启动一个最小静态服务（端口 4173）：

```powershell
$root = "d:\solo-codes\wpk"
$prefix = "http://localhost:4173/"
$l = [System.Net.HttpListener]::new()
$l.Prefixes.Add($prefix)
$l.Start()
Write-Output ("Serving " + $prefix + " from " + $root)
$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
}
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = $c.Request.Url.AbsolutePath.TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($p)) { $p = "index.html" }
    $p = $p -replace "/", "\\"
    $fp = Join-Path $root $p
    if (!(Test-Path $fp)) {
      $c.Response.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes("Not Found")
      $c.Response.OutputStream.Write($b, 0, $b.Length)
      $c.Response.Close()
      continue
    }
    $ext = [IO.Path]::GetExtension($fp).ToLowerInvariant()
    $ct = $mime[$ext]
    if (!$ct) { $ct = "application/octet-stream" }
    $c.Response.Headers.Add("Content-Type", $ct)
    $bytes = [IO.File]::ReadAllBytes($fp)
    $c.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $c.Response.Close()
  } catch {
    try {
      $c.Response.StatusCode = 500
      $b = [Text.Encoding]::UTF8.GetBytes("Server Error")
      $c.Response.OutputStream.Write($b, 0, $b.Length)
      $c.Response.Close()
    } catch {}
  }
}
```

然后浏览器打开：`http://localhost:4173/`

## 2. 客服二维码（右下角悬浮窗口）
站点右下角有“联系我们”悬浮按钮，点击后展示客服二维码。

### 2.1 图片放哪里
- 推荐路径：`assets/qr/customer-service.webp`
- 支持格式：`.webp`（推荐）/ `.png` / `.jpg`
- 建议尺寸：512×512 或 768×768（清晰且体积可控）

部署到 Cloudflare Pages 后，该图片会作为静态资源随站点发布；你只需要把二维码图片放到上述路径、提交并推送到 GitHub，Cloudflare 会自动重新部署。

### 2.2 如何更换文件名或路径
如你想使用不同文件名/格式，修改 [content.js](file:///d:/solo-codes/wpk/scripts/content.js) 中的：
- `contactWidget.qrSrc`

为避免浏览器缓存导致更新不及时，本项目对 `/assets/qr/*` 设置了较短缓存（见 [_headers](file:///d:/solo-codes/wpk/_headers)）。

## 3. 推送到 GitHub
在项目根目录执行：

```bash
git init
git add .
git commit -m "init: landing site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

## 4. Cloudflare Pages 自动部署
1. 登录 Cloudflare → Pages → Create a project → Connect to Git
2. 选择你的 GitHub 仓库
3. 构建设置：
   - Framework preset：None
   - Build command：留空
   - Output directory：留空（默认仓库根目录）
4. 部署完成后，访问 Pages 分配的域名即可

## 5. Workers / Pages Functions（API）
本仓库包含 `functions/` 目录，它会在 Cloudflare Pages 部署时自动作为 Pages Functions 发布（运行在 Workers Runtime 上）。

已提供示例接口：
- `GET /api/health`：健康检查
- `POST /api/contact`：联系表单（返回 `requestId`，便于后续接入邮件/数据库/风控）

如需把联系表单真正落库或发邮件，可在 Cloudflare 后台添加集成（例如 D1/Email/Queues），再扩展 `functions/api/contact.js` 逻辑。
