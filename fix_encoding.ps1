
$latin1 = [System.Text.Encoding]::GetEncoding(28591)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Read raw bytes
$bytes = [System.IO.File]::ReadAllBytes('index.html')

# Strip BOM
$start = 0
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $start = 3 }
$data = $bytes[$start..($bytes.Length - 1)]

# PASS 1: Latin-1 decode then re-encode to get original bytes
$pass1_str = $latin1.GetString($data)
$pass1_bytes = $latin1.GetBytes($pass1_str)

# PASS 2: Latin-1 decode then re-encode again (triple-encoding correction)
$pass2_str = $latin1.GetString($pass1_bytes)
$pass2_bytes = $latin1.GetBytes($pass2_str)

# Final UTF-8 decode
$content = [System.Text.Encoding]::UTF8.GetString($pass2_bytes)

# Fix double CRLF just in case
$content = $content -replace "`r`r`n", "`r`n"
$content = $content -replace "`r`r", "`r`n"

[System.IO.File]::WriteAllText("$PWD\index.html", $content, $utf8NoBom)

# Verify
$check = [System.IO.File]::ReadAllText('index.html', [System.Text.Encoding]::UTF8)
Write-Host "Mojibake (U+00C3) present: $($check.Contains([string][char]0x00C3))"
Write-Host "'está' found: $($check.IndexOf('está') -ge 0)"
Write-Host "'campaña' found: $($check.IndexOf('campaña') -ge 0)"
Write-Host "'Certificación' found: $($check.IndexOf('Certificación') -ge 0)"
Write-Host "'Éxito' found: $($check.IndexOf('Éxito') -ge 0)"
$b = [System.IO.File]::ReadAllBytes('index.html')
Write-Host "BOM: $($b[0]) $($b[1]) $($b[2]) (expect 60 33 68)"
