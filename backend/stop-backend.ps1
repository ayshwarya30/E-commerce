$connection = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $connection) {
    Write-Host "No backend process is listening on port 8080."
    exit 0
}

$pidToStop = $connection.OwningProcess
try {
    Stop-Process -Id $pidToStop -Force -ErrorAction Stop
    Write-Host "Stopped backend process PID $pidToStop."
} catch {
    Write-Error "Failed to stop PID $pidToStop. Run PowerShell as Administrator if needed."
    exit 1
}
