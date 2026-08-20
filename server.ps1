$root   = "d:\CrideviSPA\LA-ROSA-SPA-main"
$port   = 3000

$mimeMap = @{
  ".html"  = "text/html; charset=utf-8"
  ".css"   = "text/css; charset=utf-8"
  ".js"    = "application/javascript; charset=utf-8"
  ".json"  = "application/json"
  ".png"   = "image/png"
  ".jpg"   = "image/jpeg"
  ".jpeg"  = "image/jpeg"
  ".svg"   = "image/svg+xml"
  ".ico"   = "image/x-icon"
  ".txt"   = "text/plain"
  ".xml"   = "text/xml"
  ".webp"  = "image/webp"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server running: http://localhost:$port/" -ForegroundColor Green
Write-Host "Admin panel:   http://localhost:$port/admin/" -ForegroundColor Yellow

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  $urlPath = $req.Url.LocalPath
  if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }
  if ($urlPath -eq "/admin/" -or $urlPath -eq "/admin") { $urlPath = "/admin/index.html" }

  $filePath = Join-Path $root ($urlPath.TrimStart("/").Replace("/", "\"))

  if (Test-Path $filePath -PathType Leaf) {
    $ext  = [IO.Path]::GetExtension($filePath).ToLower()
    $mime = $mimeMap[$ext]
    if (-not $mime) { $mime = "application/octet-stream" }
    $bytes = [IO.File]::ReadAllBytes($filePath)
    $res.StatusCode      = 200
    $res.ContentType     = $mime
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $body = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
    $res.StatusCode      = 404
    $res.ContentType     = "text/plain"
    $res.ContentLength64 = $body.Length
    $res.OutputStream.Write($body, 0, $body.Length)
  }
  $res.OutputStream.Close()
}
