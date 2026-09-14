import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`SELECT id, name, email, role FROM "User" WHERE LOWER(name) LIKE '%alex%' OR LOWER(email) LIKE '%alex%'`);
    console.log('Found matching users:', res.rows);

    if (res.rows.length > 0) {
      for (const u of res.rows) {
        await pool.query(`UPDATE "User" SET role = 'ADMIN' WHERE id = $1`, [u.id]);
        console.log(`Successfully updated ${u.name} (${u.email}) to role: ADMIN`);
      }
    } else {
      console.log('No user named Alex Morgan found. Listing all users:');
      const all = await pool.query(`SELECT id, name, email, role FROM "User"`);
      console.log(all.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
