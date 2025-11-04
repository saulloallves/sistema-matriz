# ===================================================================================
# SCRIPT 2: EXPORTAÇÃO DE DADOS E LÓGICA (FUNÇÕES, TRIGGERS)
# ===================================================================================
$utf8NoBom = New-Object System.Text.UTF8Encoding($false); [Console]::OutputEncoding = $utf8NoBom
$ORIGEM_DB_URL = "postgresql://postgres.zqexpclhdrbnevxheiax:bUF6GdnN65ntAotG@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
$SCHEMA_PRINCIPAL = "storage"
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin'
$PG_DUMP_PATH = Join-Path $PG_BIN_PATH 'pg_dump.exe'
$WORK_DIR = Join-Path $env:TEMP "migracao_supabase_v2"

if (-not (Test-Path $WORK_DIR)) { New-Item -ItemType Directory -Path $WORK_DIR | Out-Null }

# --- DADOS ---
Write-Host "`n--- Baixando DADOS de '$SCHEMA_PRINCIPAL' no formato INSERT ---"
$outputFileDados = Join-Path $WORK_DIR "02_dados.sql"
# CORREÇÃO: Adiciona --column-inserts para usar INSERT em vez de COPY
$commandDados = "& `"$PG_DUMP_PATH`" --data-only --column-inserts --schema=`"$SCHEMA_PRINCIPAL`" --dbname=`"$ORIGEM_DB_URL`" | Out-File -FilePath `"$outputFileDados`" -Encoding utf8"
Invoke-Expression $commandDados
Write-Host "✅ Dados salvos em: $outputFileDados"

# --- LÓGICA (FUNÇÕES, TRIGGERS, CONSTRAINTS) ---
Write-Host "`n--- Baixando LOGICA (funcoes, triggers, constraints) de '$SCHEMA_PRINCIPAL' ---"
$outputFileLogica = Join-Path $WORK_DIR "03_logica.sql"
# --section=post-data inclui triggers, constraints, etc.
$commandLogica = "& `"$PG_DUMP_PATH`" --schema-only --schema=`"$SCHEMA_PRINCIPAL`" --section=post-data --dbname=`"$ORIGEM_DB_URL`" | Out-File -FilePath `"$outputFileLogica`" -Encoding utf8"
Invoke-Expression $commandLogica
Write-Host "✅ Logica salva em: $outputFileLogica"