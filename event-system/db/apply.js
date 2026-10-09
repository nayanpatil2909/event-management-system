// Woxsen University DBMS Project 31
// db/apply.js - Database Schema and Seed Runner

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function apply() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'evt_app',
    password: process.env.DB_PASSWORD || 'StrongPass#123',
    database: process.env.DB_NAME || 'event_system',
    multipleStatements: true
  };

  console.log(`Connecting to MySQL at ${config.host}:${config.port} as ${config.user}...`);
  const conn = await mysql.createConnection(config);

  try {
    console.log('Reading db/schema.sql...');
    const schemaRaw = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Parse out DELIMITER // ... DELIMITER ; blocks
    const delimiterRegex = /DELIMITER\s+\/\/\s*([\s\S]*?)\s*DELIMITER\s*;/gi;
    let schemaWithoutTriggers = schemaRaw;
    const triggers = [];

    let match;
    while ((match = delimiterRegex.exec(schemaRaw)) !== null) {
      const block = match[1];
      // Inside block, triggers are separated by //
      const triggerStatements = block.split('//').map(s => s.trim()).filter(s => s.length > 0);
      triggers.push(...triggerStatements);
    }

    schemaWithoutTriggers = schemaRaw.replace(delimiterRegex, '');

    console.log('Executing base schema (tables, constraints, indexes, views)...');
    await conn.query(schemaWithoutTriggers);

    console.log(`Executing ${triggers.length} triggers individually...`);
    for (const triggerSql of triggers) {
      if (triggerSql.trim()) {
        await conn.query(triggerSql);
      }
    }
    console.log('Schema and triggers successfully applied.');

    console.log('Reading db/seed.sql...');
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('Executing seed data...');
      await conn.query(seedSql);
      console.log('Seed data successfully inserted.');
    } else {
      console.warn('seed.sql not found; run generate_seed.js first.');
    }

    // Verification check
    const [tables] = await conn.query('SHOW TABLES');
    console.log(`Database verification: Found ${tables.length} tables/views in ${config.database}:`);
    tables.forEach(t => console.log('  -', Object.values(t)[0]));

    const [trigs] = await conn.query('SHOW TRIGGERS');
    console.log(`Verified ${trigs.length} triggers:`, trigs.map(t => t.Trigger).join(', '));

    console.log('\n[SUCCESS] db:setup completed cleanly.');
  } catch (err) {
    console.error('\n[ERROR] Database application failed:', err.message);
    if (err.sql) {
      console.error('Failing SQL segment:', err.sql.slice(0, 200));
    }
    process.exit(1);
  } finally {
    await conn.end();
  }
}

apply();
