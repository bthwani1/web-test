# PowerShell version of snapshot_stage.sh
param(
    [string]$BASE = "https://staging.example.tld"
)

# Create reports/headers directory if it doesn't exist
if (!(Test-Path "reports/headers")) {
    New-Item -ItemType Directory -Path "reports/headers" -Force
}

# Initialize JSON array
$jsonArray = @()

# URLs to check
$urls = @(
    "$BASE/",
    "$BASE/checkout",
    "$BASE/api/v1/profile"
)

foreach ($url in $urls) {
    try {
        # Make HTTP request and get headers
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
        
        # Extract headers
        $csp = $response.Headers["Content-Security-Policy"]
        $cors = $response.Headers["Access-Control-Allow-Origin"]
        $hsts = $response.Headers["Strict-Transport-Security"]
        $setCookie = $response.Headers["Set-Cookie"]
        
        # Create header object
        $headers = @{
            "content-security-policy" = if ($csp) { $csp } else { "" }
            "access-control-allow-origin" = if ($cors) { $cors } else { "" }
            "strict-transport-security" = if ($hsts) { $hsts } else { "" }
            "set-cookie" = if ($setCookie) { $setCookie } else { "" }
        }
        
        # Add to array
        $jsonArray += @{
            url = $url
            headers = $headers
        }
        
        Write-Host "Checked: $url"
    }
    catch {
        Write-Host "Error checking $url : $($_.Exception.Message)"
        
        # Add empty entry for failed requests
        $jsonArray += @{
            url = $url
            headers = @{
                "content-security-policy" = ""
                "access-control-allow-origin" = ""
                "strict-transport-security" = ""
                "set-cookie" = ""
            }
        }
    }
}

# Convert to JSON and save
$jsonArray | ConvertTo-Json -Depth 3 | Out-File -FilePath "reports/headers/staging.json" -Encoding UTF8

Write-Host "OK -> reports/headers/staging.json"
