param(
    [Parameter(Mandatory = $true)]
    [string]$Database,
    [string]$DbHost = "localhost",
    [int]$Port = 5432,
    [string]$Username = "postgres",
    [string]$OutputPath = ".\\docker\\postgres\\init\\10-local-dev.sql",
    [string]$Password
)

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutput
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

if ($Password) {
    $env:PGPASSWORD = $Password
}

$arguments = @(
    "--host", $DbHost,
    "--port", "$Port",
    "--username", $Username,
    "--format=plain",
    "--no-owner",
    "--no-privileges",
    "--encoding=UTF8",
    "--file", $resolvedOutput,
    $Database
)

try {
    Write-Host "Creating a read-only pg_dump from local PostgreSQL..."
    & pg_dump @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE."
    }
    Write-Host "Dump created at $resolvedOutput"
    Write-Host "This does not modify your local PostgreSQL database."
}
finally {
    if ($Password) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}
