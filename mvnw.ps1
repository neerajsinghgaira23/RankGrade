# Root PowerShell wrapper delegating to backend/mvnw.cmd
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\backend\mvnw.cmd" $args
