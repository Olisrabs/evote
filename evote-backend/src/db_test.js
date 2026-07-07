import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testConnection(url, name) {
  console.log(`Testing ${name}...`);
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`✅ ${name} connected successfully!`);
    const res = await client.query('SELECT NOW()');
    console.log(`   Time from DB: ${res.rows[0].now}`);
    await client.end();
  } catch (err) {
    console.error(`❌ ${name} failed to connect:`, err.message);
  }
}

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  console.log(`DATABASE_URL: ${dbUrl}`);
  console.log(`DIRECT_URL: ${directUrl}`);
  await testConnection(dbUrl, 'DATABASE_URL (Pooler)');
  await testConnection(directUrl, 'DIRECT_URL (Direct)');
}

run();
