import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').unique().notNull(),
	qrID: text('qrID').unique().notNull(),
})

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: integer('userId')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull(),
})

export const urls = sqliteTable('urls', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }), // This is unique
	unshortened: text('unshortened').notNull(), // This can't repeat
	shortened: text('shortened').notNull().unique(),
	creationDate: text('creationDate')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	deletionDate: text('deletionDate'),
	type: text('type', { enum: ['default', 'custom'] }).notNull(),
})

export const InsertURLSchema = createInsertSchema(urls, {
	unshortened: (schema) => schema.unshortened.url({ message: 'Please provide a valid url' }),
	shortened: (schema) => schema.shortened.max(9, { message: 'Error on generating shortened URL: Length is too big' }),
})
export type URLSchema = z.infer<typeof InsertURLSchema>
export const SelectURLSchema = createSelectSchema(urls)
export const InsertUsersSchema = createInsertSchema(users)
export const SelectUsersSchema = createSelectSchema(users)
