# Shared Docker helpers behind the Windows start/stop scripts.
#
# Native commands are checked with $LASTEXITCODE rather than $ErrorActionPreference:
# docker writes its build progress to stderr, which 'Stop' would treat as a failure.

$ImageName = 'prelegal'
$ContainerName = 'prelegal'
$Port = 8000
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Wait-PrelegalHealth {
    foreach ($attempt in 1..90) {
        try {
            Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -UseBasicParsing -TimeoutSec 2 | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    throw "Prelegal did not become healthy. Check: docker logs $ContainerName"
}

function Start-Prelegal {
    Push-Location $ProjectRoot
    try {
        docker build -t $ImageName .
        if ($LASTEXITCODE -ne 0) { throw 'docker build failed' }

        docker rm -f $ContainerName 2>&1 | Out-Null

        $envArgs = @()
        if (Test-Path '.env') { $envArgs = @('--env-file', '.env') }

        docker run -d --name $ContainerName -p "${Port}:8000" @envArgs $ImageName | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'docker run failed' }

        Wait-PrelegalHealth
        Write-Output "Prelegal is running at http://localhost:$Port"
    } finally {
        Pop-Location
    }
}

function Stop-Prelegal {
    docker rm -f $ContainerName 2>&1 | Out-Null
    Write-Output 'Prelegal stopped. Its database went with the container.'
}
