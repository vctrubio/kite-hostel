const { config } = require('dotenv');
const postgres = require('postgres');

// Load environment variables
config({ path: '.env.local' });

async function testConnection() {
  try {
    const sql = postgres(process.env.DATABASE_URL, {
      prepare: false,
    });
    
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // Test if our tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tables in public schema:');
    tables.forEach(table => {
      console.log('  -', table.table_name);
    });
    
    // Test if enums exist
    const enums = await sql`
      SELECT typname as enum_name
      FROM pg_type 
      WHERE typcategory = 'E' 
      AND typname NOT LIKE 'pg_%'
      ORDER BY typname;
    `;
    
    console.log('\n🔢 Custom enums:');
    enums.forEach(enumType => {
      console.log('  -', enumType.enum_name);
    });
    
    await sql.end();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
