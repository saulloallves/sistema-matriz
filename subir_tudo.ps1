# ===================================================================================
# SCRIPT 4: SUBIR TUDO EM ETAPAS
# ===================================================================================
$utf8NoBom = New-Object System.Text.UTF8Encoding($false); [Console]::OutputEncoding = $utf8NoBom
$DESTINO_DB_URL  = "postgresql://postgres.wpuwsocezhlqlqxifpyk:gE0anJdTbfIfORoy@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
$PG_BIN_PATH = 'C:\Program Files\PostgreSQL\17\bin'
$PSQL_PATH = Join-Path $PG_BIN_PATH 'psql.exe'
$FORMATADOS_DIR = Join-Path $env:TEMP "migracao_supabase_v2\formatados"

if (-not (Test-Path $FORMATADOS_DIR)) { Write-Host "Diretorio 'formatados' nao encontrado." -ForegroundColor Red; exit 1 }

# Pega os arquivos na ordem correta (01, 02, 03)
$arquivosParaSubir = Get-ChildItem -Path $FORMATADOS_DIR -Filter "*.sql" | Sort-Object Name

foreach ($arquivo in $arquivosParaSubir) {
    Write-Host "`n--- Subindo arquivo: $($arquivo.Name) ---" -ForegroundColor Cyan
    
    # Para os dados, limpamos as tabelas primeiro
    if ($arquivo.Name -eq "02_dados.sql") {
        Write-Host "  - Limpando dados antigos (TRUNCATE)..."
        $tabelasQuery = "SELECT 'storage.' || tablename FROM pg_tables WHERE schemaname = 'storage';"
        $tabelas = & $PSQL_PATH --dbname "$DESTINO_DB_URL" --tuples-only -c $tabelasQuery | ForEach-Object { $_.Trim() } | Where-Object { $_ }
        $truncateCommand = "TRUNCATE TABLE $($tabelas -join ', ') RESTART IDENTITY CASCADE;"
        & $PSQL_PATH --quiet --dbname "$DESTINO_DB_URL" -c $truncateCommand
        if ($LASTEXITCODE -ne 0) { Write-Host "ERRO ao limpar tabelas." -ForegroundColor Red; exit 1 }
    }

    & $PSQL_PATH --quiet --set=ON_ERROR_STOP=1 --dbname "$DESTINO_DB_URL" --file "$($arquivo.FullName)"
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "ERRO: Falha ao aplicar '$($arquivo.Name)'. Processo interrompido." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Arquivo aplicado com sucesso." -ForegroundColor Green
    }
}
Write-Host "`n🎉 Migracao concluida com sucesso!" -ForegroundColor Cyan