const { pool } = require("../config/db");

let roleColumnPromise;

async function hasRoleColumn() {
  if (!roleColumnPromise) {
    roleColumnPromise = pool
      .query(
        `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'users'
              AND column_name = 'role'
          ) AS exists
        `
      )
      .then((result) => Boolean(result.rows[0]?.exists));
  }

  return roleColumnPromise;
}

async function getRoleSelectSql(alias = "users") {
  return (await hasRoleColumn())
    ? `${alias}.role AS role`
    : `'user'::text AS role`;
}

module.exports = { hasRoleColumn, getRoleSelectSql };
