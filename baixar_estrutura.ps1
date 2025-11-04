# ===================================================================================
# SCRIPT 1: EXPORTAÇÃO DA ESTRUTURA (TABELAS, TYPES, ENUMS)
# ===================================================================================
$utf8NoBom = New-Object System.Text.UTF8Encoding($false); [Console]::OutputEncoding = $utf8NoBom
$ORIGEM_DB_URL = "postgresql://postgres.zqexpclhdrbnevxheiax:bUF6GdnN65ntAotG@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
$SCHEMA_PRINCIPAL = "storage"
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin'
$PG_DUMP_PATH = Join-Path $PG_BIN_PATH 'pg_dump.exe'
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase_v2"

# Limpa e recria o diretório de trabalho
if (Test-Path $WORK_DIR) { Remove-Item -Path $WORK_DIR -Recurse -Force }
New-Item -ItemType Directory -Path $WORK_DIR | Out-Null
Write-Host "Diretorio de trabalho preparado: $WORK_DIR"

Write-Host "`n--- Baixando ESTRUTURA (schema, tabelas, types) de '$SCHEMA_PRINCIPAL' ---"
$outputFile = Join-Path $WORK_DIR "01_estrutura.sql"
# --section=pre-data inclui tabelas, types, enums. Exclui dados, funções, triggers, constraints.
$command = "& `"$PG_DUMP_PATH`" --schema-only --schema=`"$SCHEMA_PRINCIPAL`" --section=pre-data --dbname=`"$ORIGEM_DB_URL`" | Out-File -FilePath `"$outputFile`" -Encoding utf8"
Invoke-Expression $command
Write-Host "✅ Estrutura salva em: $outputFile"