// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const families = sqliteTable('families', {id:text('id').primaryKey(), email:text('email').notNull().unique(), salt:text('salt').notNull(), password:text('password').notNull(), state:text('state').notNull(), session:text('session'), expires:integer('expires')});
export const loginLimits = sqliteTable('login_limits', {id:text('id').primaryKey(), count:integer('count').notNull(), bucket:integer('bucket').notNull()});
