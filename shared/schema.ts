import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  openrouterApiKey: text("openrouter_api_key"),
  selectedModel: text("selected_model"),
  defaultGenre: text("default_genre"),
  defaultWordCount: integer("default_word_count").default(50000),
  autoSave: boolean("auto_save").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  targetWordCount: integer("target_word_count").notNull(),
  currentWordCount: integer("current_word_count").default(0),
  status: text("status").notNull().default("idea"), // idea, outline, approved, writing, completed
  progress: integer("progress").default(0), // percentage 0-100
  description: text("description"),
  targetAudience: text("target_audience"),
  keyPoints: text("key_points").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const outlines = pgTable("outlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  chapters: json("chapters").$type<Array<{
    id: string;
    title: string;
    description: string;
    keyPoints: string[];
    estimatedWordCount: number;
  }>>().notNull(),
  isApproved: boolean("is_approved").default(false),
  approvedAt: timestamp("approved_at"),
  totalChapters: integer("total_chapters").notNull(),
  totalEstimatedWords: integer("total_estimated_words").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  outlineId: varchar("outline_id").references(() => outlines.id).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  wordCount: integer("word_count").default(0),
  status: text("status").notNull().default("pending"), // pending, writing, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookIdeas = pgTable("book_ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  genre: text("genre").notNull(),
  targetAudience: text("target_audience"),
  keyPoints: text("key_points").array(),
  isSelected: boolean("is_selected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentWordCount: true,
  progress: true,
});

export const insertOutlineSchema = createInsertSchema(outlines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isApproved: true,
  approvedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookIdeaSchema = createInsertSchema(bookIdeas).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertOutline = z.infer<typeof insertOutlineSchema>;
export type Outline = typeof outlines.$inferSelect;

export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

export type InsertBookIdea = z.infer<typeof insertBookIdeaSchema>;
export type BookIdea = typeof bookIdeas.$inferSelect;
