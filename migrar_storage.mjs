// ===================================================================================
// SCRIPT DE MIGRAÇÃO DO SUPABASE STORAGE
// Objetivo: Copiar todos os buckets e arquivos de um projeto de ORIGEM para um de DESTINO.
// ===================================================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURAÇÕES ---
// IMPORTANTE: Preencha com as informações dos seus projetos de ORIGEM e DESTINO.
// Você encontra essas chaves em: Project Settings -> API

const ORIGIN_CONFIG = {
    url: 'https://zqexpclhdrbnevxheiax.supabase.co', // ex: https://xxxxxxxx.supabase.co
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZXhwY2xoZHJibmV2eGhlaWF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDAxNSwiZXhwIjoyMDczMDE2MDE1fQ.arLOBJlaqpj4XQUgVkOfRcrfQx-qgZedibXgCcMWG9M' // A chave "service_role"
};

const DESTINATION_CONFIG = {
    url: 'https://wpuwsocezhlqlqxifpyk.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwdXdzb2NlemhscWxxeGlmcHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4MDQ1OCwiZXhwIjoyMDc1MzU2NDU4fQ.Wgzn0DZ9laANPSEP4N75LdjTEjK-f69TOmOCQQvksQE' // A chave "service_role"
};

const TEMP_DOWNLOAD_DIR = './storage_temp_download';
// --- FIM DAS CONFIGURAÇÕES ---

const originSupabase = createClient(ORIGIN_CONFIG.url, ORIGIN_CONFIG.serviceKey);
const destSupabase = createClient(DESTINATION_CONFIG.url, DESTINATION_CONFIG.serviceKey);

async function main() {
    console.log('Iniciando a migração do Supabase Storage...');

    // 1. Garante que o diretório temporário exista e esteja limpo
    await fs.rm(TEMP_DOWNLOAD_DIR, { recursive: true, force: true });
    await fs.mkdir(TEMP_DOWNLOAD_DIR, { recursive: true });
    console.log('Diretório temporário preparado.');

    // 2. Busca os buckets do projeto de origem
    const { data: originBuckets, error: listError } = await originSupabase.storage.listBuckets();
    if (listError) throw new Error(`Erro ao listar buckets da origem: ${listError.message}`);
    console.log(`Encontrados ${originBuckets.length} buckets na origem.`);

    for (const bucket of originBuckets) {
        console.log(`\n--- Processando bucket: ${bucket.id} ---`);

        // 3. Cria o mesmo bucket no projeto de destino
        console.log(`Criando bucket '${bucket.id}' no destino...`);
        const { error: createBucketError } = await destSupabase.storage.createBucket(bucket.id, { public: bucket.public });
        if (createBucketError && !createBucketError.message.includes('Bucket already exists')) {
            console.error(`Erro ao criar bucket no destino: ${createBucketError.message}`);
            continue; // Pula para o próximo bucket se houver erro
        }

        // 4. Lista todos os arquivos no bucket de origem
        console.log('Listando arquivos na origem...');
        const { data: files, error: listFilesError } = await originSupabase.storage.from(bucket.id).list('', { limit: 2000 }); // Aumente o limite se tiver mais de 2000 arquivos
        if (listFilesError) {
            console.error(`Erro ao listar arquivos do bucket '${bucket.id}': ${listFilesError.message}`);
            continue;
        }
        console.log(`Encontrados ${files.length} arquivos para copiar.`);

        for (const file of files) {
            // 5. Baixa o arquivo da origem
            process.stdout.write(`  - Baixando '${file.name}'...`);
            const { data: blob, error: downloadError } = await originSupabase.storage.from(bucket.id).download(file.name);
            if (downloadError) {
                console.error(`\nErro ao baixar '${file.name}': ${downloadError.message}`);
                continue;
            }

            const buffer = Buffer.from(await blob.arrayBuffer());

            // 6. Sobe o arquivo para o destino
            process.stdout.write(` subindo...`);
            const { error: uploadError } = await destSupabase.storage.from(bucket.id).upload(file.name, buffer, {
                contentType: file.metadata.mimetype,
                cacheControl: file.metadata.cacheControl,
                upsert: true // Sobrescreve se o arquivo já existir
            });

            if (uploadError) {
                console.error(`\nErro ao subir '${file.name}': ${uploadError.message}`);
            } else {
                process.stdout.write(` OK!\n`);
            }
        }
    }

    console.log('\n🎉 Migração do Storage concluída com sucesso!');
}

main().catch(err => {
    console.error('\n\nERRO CRÍTICO:', err.message);
    process.exit(1);
});