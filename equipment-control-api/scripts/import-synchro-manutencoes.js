const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/);

    if (!match) {
      continue;
    }

    const [, key, value] = match;

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function normalizeApiUrl(baseUrl) {
  const trimmed = String(baseUrl || '').replace(/\/+$/, '');
  return trimmed.endsWith('/api')
    ? `${trimmed}/manutencoes/synchro/bulk`
    : `${trimmed}/api/manutencoes/synchro/bulk`;
}

async function main() {
  loadEnvFile();

  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error(
      'Uso: node scripts/import-synchro-manutencoes.js <arquivo.json>',
    );
  }

  const raw = fs.readFileSync(path.resolve(process.cwd(), inputPath), 'utf8');
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed) ? parsed : parsed.items;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('O JSON deve ser um array ou um objeto com a propriedade "items".');
  }

  const baseUrl =
    process.env.SYNCHRO_API_URL ||
    process.env.REACT_APP_API_URL ||
    `http://127.0.0.1:${process.env.PORT || '3000'}`;

  const integrationKey = process.env.SYNCHRO_INTEGRATION_KEY;

  if (!integrationKey) {
    throw new Error('SYNCHRO_INTEGRATION_KEY não configurada.');
  }

  const response = await fetch(normalizeApiUrl(baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-integration-key': integrationKey,
    },
    body: JSON.stringify({ items }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Falha ${response.status}: ${text}`);
  }

  console.log(text);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
