# CrideviSPA — Pure PowerShell HTTP Server
$port    = 3000
$baseDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($baseDir)) {
    $baseDir = "d:\CrideviSPA\LA-ROSA-SPA-main"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "------------------------------------------------------"
    Write-Host "CrideviSPA Server  ->  http://localhost:$port/"
    Write-Host "Press Ctrl+C to stop"
    Write-Host "------------------------------------------------------"
} catch {
    Write-Host "Failed to start on port ${port}: $_"
    exit 1
}

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
    ".xml"  = "application/xml; charset=utf-8"
}

while ($listener.IsListening) {
    $response = $null
    try {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        $cleanPath = $urlPath.Replace("/", "\").TrimStart("\")
        $filePath  = Join-Path $baseDir $cleanPath

        # Directory -> index.html
        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        # Add CORS and dev cache headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext   = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime  = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }

            $response.StatusCode   = 200
            $response.ContentType  = $mime
            $response.ContentLength64 = $bytes.Length

            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $body  = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.StatusCode   = 404
            $response.ContentType  = "text/plain; charset=utf-8"
            $response.ContentLength64 = $body.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($body, 0, $body.Length)
            }
        }
    } catch {
        # Gracefully continue on connection aborts from rapid refreshes
    } finally {
        if ($null -ne $response) {
            try { $response.Close() } catch {}
        }
    }
}
