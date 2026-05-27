
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres:0bsjBP0UBOt4ZYVs@db.hvovitpvkmklzihnzgbt.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;