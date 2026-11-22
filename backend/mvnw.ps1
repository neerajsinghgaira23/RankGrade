# ==============================================================================
# RankGrade Maven Portable Runner
# ==============================================================================
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MavenArgs
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MavenVersion = "3.9.9"
$MvnHome = Join-Path $env:USERPROFILE ".m2\wrapper\dists\apache-maven-$MavenVersion"
$MvnCmd = Join-Path $MvnHome "apache-maven-$MavenVersion\bin\mvn.cmd"

if (-not (Test-Path $MvnCmd)) {
    Write-Host "Installing Maven $MavenVersion for RankGrade..." -ForegroundColor Cyan
    $ZipPath = Join-Path $env:TEMP "apache-maven-$MavenVersion-bin.zip"
    $Url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MavenVersion/apache-maven-$MavenVersion-bin.zip"
    
    if (-not (Test-Path $ZipPath)) {
        Write-Host "Downloading $Url..." -ForegroundColor DarkGray
        Invoke-WebRequest -Uri $Url -OutFile $ZipPath
    }
    
    if (-not (Test-Path $MvnHome)) {
        New-Item -ItemType Directory -Force -Path $MvnHome | Out-Null
    }
    
    Write-Host "Extracting to $MvnHome..." -ForegroundColor DarkGray
    Expand-Archive -Path $ZipPath -DestinationPath $MvnHome -Force
    Write-Host "Maven installed successfully!" -ForegroundColor Green
}

& $MvnCmd $MavenArgs
exit $LASTEXITCODE
