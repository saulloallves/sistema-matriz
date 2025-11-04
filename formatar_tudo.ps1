# ===================================================================================
# SCRIPT 3: FORMATAÇÃO DE TODOS OS ARQUIVOS
# ===================================================================================
$utf8NoBom = New-Object System.Text.UTF8Encoding($false); [Console]::OutputEncoding = $utf8NoBom
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase_v2"
$DESTINO_DIR = Join-Path $WORK_DIR "formatados"

if (Test-Path $DESTINO_DIR) { Remove-Item -Path $DESTINO_DIR -Recurse -Force }
New-Item -ItemType Directory -Path $DESTINO_DIR | Out-Null
Write-Host "Arquivos formatados serao salvos em: $DESTINO_DIR"

$allSqlFiles = Get-ChildItem -Path $WORK_DIR -Filter "*.sql"
foreach ($arquivo in $allSqlFiles) {
    $destinoPath = Join-Path $DESTINO_DIR $arquivo.Name
    Write-Host "`n-> Formatando: $($arquivo.Name)"
    $conteudo = Get-Content $arquivo.FullName -Raw

    # Aplica todas as correções de idempotência
    $conteudo = $conteudo -replace "(?m)^CREATE SCHEMA .*;", "CREATE SCHEMA IF NOT EXISTS storage;"
    $conteudo = $conteudo -replace "(?i)CREATE TABLE", "CREATE TABLE IF NOT EXISTS"
    $conteudo = $conteudo -replace '(?i)CREATE TYPE ([\w."]+) AS ENUM', "DROP TYPE IF EXISTS `$1 CASCADE;`nCREATE TYPE `$1 AS ENUM"
    $conteudo = $conteudo -replace "(?i)CREATE SEQUENCE", "CREATE SEQUENCE IF NOT EXISTS"
    $conteudo = $conteudo -replace "(?i)CREATE FUNCTION", "CREATE OR REPLACE FUNCTION"
    $conteudo = $conteudo -replace "(?i)CREATE TRIGGER", "CREATE OR REPLACE TRIGGER"
    $conteudo = $conteudo -replace "(?m)^SELECT pg_catalog.setval.*?;\s*", ""

    [System.IO.File]::WriteAllLines($destinoPath, $conteudo.Split([System.Environment]::NewLine), $utf8NoBom)
}
Write-Host "`n🎯 Todos os arquivos foram formatados." -ForegroundColor Yellow