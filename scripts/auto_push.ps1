<#
Auto push watcher
Watches the frontend/src folder for file changes and, after a short debounce timeout,
performs: git add -A; git commit -m "Auto commit: <timestamp>"; git push origin edits

Usage (PowerShell):
    # from repo root
    powershell -ExecutionPolicy Bypass -File .\scripts\auto_push.ps1

Notes:
- Ensure the repository root has the remote set (origin) and that auth is configured (PAT or SSH).
- This script is intentionally simple and uses timestamp commits. If you want custom commit messages
  or staging rules, modify the `Perform-CommitPush` function.
- To stop: Ctrl+C in the running PowerShell process.
#>

param(
    [string]$WatchPath = "frontend\src",
    [int]$DebounceMs = 2500,
    [string]$RemoteName = 'origin',
    [string]$RemoteBranch = 'edits'
)

# Move to repo root (script directory assumed inside workspace root)
Set-Location $PSScriptRoot

function Log { param($s) $ts = (Get-Date).ToString('o'); Write-Output "[$ts] $s" }

$FullWatchPath = Join-Path $PSScriptRoot $WatchPath
if (-not (Test-Path $FullWatchPath)) {
    Log "Watch path not found: $FullWatchPath";
    exit 1
}

# Debounce state
$pending = $false
$lastEvent = Get-Date
$timer = New-Object Timers.Timer $DebounceMs
$timer.AutoReset = $false
Register-ObjectEvent -InputObject $timer -EventName Elapsed -Action {
    if ($pending) {
        $pending = $false
        Log "Debounce elapsed — preparing to commit & push changes."
        Perform-CommitPush
    }
}

function Perform-CommitPush {
    try {
        # Ensure we are at repo root
        Set-Location $PSScriptRoot

        # Add everything under watch path to staging
        git add -- $WatchPath 2>$null

        # Check if there is anything to commit
        $porcelain = git status --porcelain
        if ([string]::IsNullOrWhiteSpace($porcelain)) {
            Log "No changes to commit."
            return
        }

        $msg = "Auto commit: " + (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssZ')
        git commit -m "$msg" || Write-Output "git commit returned non-zero code (maybe no changes)."

        # Push to remote branch (set upstream if needed)
        Log "Pushing to $RemoteName/$RemoteBranch..."
        $pushCmd = "git push $RemoteName HEAD:$RemoteBranch"
        Invoke-Expression $pushCmd
        if ($LASTEXITCODE -eq 0) { Log "Push succeeded." } else { Log "Push failed with exit code $LASTEXITCODE." }
    } catch {
        Log "Error during commit/push: $_"
    }
}

# Create FileSystemWatcher
$fsw = New-Object System.IO.FileSystemWatcher $FullWatchPath -Property @{IncludeSubdirectories=$true; NotifyFilter=[IO.NotifyFilters]'FileName, LastWrite, DirectoryName'}
$action = {
    $global:pending = $true
    $global:lastEvent = Get-Date
    # restart timer
    $timer.Stop()
    $timer.Start()
    Log "Detected change: $($Event.SourceEventArgs.ChangeType) -> $($Event.SourceEventArgs.FullPath)"
}

Register-ObjectEvent -InputObject $fsw -EventName Changed -Action $action | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Created -Action $action | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Deleted -Action $action | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Renamed -Action $action | Out-Null

$fsw.EnableRaisingEvents = $true

Log "Watching $FullWatchPath for changes. Debounce = ${DebounceMs}ms. Press Ctrl+C to stop."

# Keep process alive
while ($true) { Start-Sleep -Seconds 3600 }
