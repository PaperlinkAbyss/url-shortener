import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').unique(),
	email: text('email').unique().notNull(),
	hashedPassword: text('hashedPassword'),
})

export const InsertUsersSchema = createInsertSchema(users)
export const SelectUsersSchema = createSelectSchema(users)
export type InsertUsers = typeof InsertUsersSchema

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: integer('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expiresAt').notNull(),
})

export const urls = sqliteTable('urls', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	unshortened: text('unshortened').notNull(),
	shortened: text('shortened').notNull().unique(),
	creationDate: text('creationDate')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	deletionDate: text('deletionDate'),
	type: text('type', { enum: ['default', 'custom'] }).notNull(),
	userId: integer('userId')
		.references(() => users.id)
		.notNull(),
	visits: integer('visits').default(0).notNull(),
})
export const InsertURLSchema = createInsertSchema(urls, {
	unshortened: (schema) => schema.unshortened.url({ message: 'Please provide a valid url' }),
	shortened: (schema) => schema.shortened.max(9, { message: 'Error on generating shortened URL: Length is too big' }),
})
export const SelectURLSchema = createSelectSchema(urls)
export type URLType = z.infer<typeof SelectURLSchema>

export const userRelations = relations(users, ({ one, many }) => ({
	sessions: many(sessionTable, {
		relationName: 'sessionRelation',
	}),
	urls: many(urls, { relationName: 'urlRelation' }),
}))

export const sessionRelations = relations(sessionTable, ({ one }) => ({
	user: one(users, { fields: [sessionTable.userId], references: [users.id], relationName: 'sessionRelation' }),
}))

export const urlsRelations = relations(urls, ({ one }) => ({
	user: one(users, { fields: [urls.userId], references: [users.id], relationName: 'urlRelation' }),
}))

export type URLSchema = z.infer<typeof InsertURLSchema>
