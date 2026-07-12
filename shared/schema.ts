import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  serial,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for simple authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("educator").notNull(), // educator, student, admin
  subscriptionTier: varchar("subscription_tier").default("free").notNull(), // free, pro, premium
  razorpayCustomerId: varchar("razorpay_customer_id"),
  razorpaySubscriptionId: varchar("razorpay_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Tutors created by educators
export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  password: varchar("password"), // for password-protected access
  avatarStyle: varchar("avatar_style").default("default"),
  voiceSettings: jsonb("voice_settings"),
  branding: jsonb("branding"), // custom colors, logo, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content uploaded to train tutors
export const tutorContent = pgTable("tutor_content", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => tutors.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, docx, txt, youtube, etc.
  fileSize: integer("file_size"),
  content: text("content"), // processed text content
  metadata: jsonb("metadata"), // additional file info
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Chat sessions between students and tutors
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => tutors.id),
  studentId: varchar("student_id"), // null for anonymous users
  sessionToken: varchar("session_token").notNull().unique(), // for anonymous access
  startedAt: timestamp("started_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  duration: integer("duration").default(0), // in seconds
});

// Individual chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // voice settings, emotion, etc.
});

// Analytics for educators
export const tutorAnalytics = pgTable("tutor_analytics", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => tutors.id),
  date: timestamp("date").notNull(),
  totalSessions: integer("total_sessions").default(0),
  totalMessages: integer("total_messages").default(0),
  avgSessionDuration: decimal("avg_session_duration").default("0"),
  uniqueStudents: integer("unique_students").default(0),
  popularQuestions: jsonb("popular_questions"),
});

// AI literacy courses
export const aiCourses = pgTable("ai_courses", {
  id: serial("id").primaryKey(),
  band: varchar("band").notNull(), // band-a, band-b, band-c, band-d
  gradeRange: varchar("grade_range").notNull(), // Class 3-5
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  overview: text("overview").notNull(),
  prerequisites: text("prerequisites"),
  totalDurationMinutes: integer("total_duration_minutes").default(0),
  glossary: jsonb("glossary").default([]), // [{term, definition}]
  teacherGuide: jsonb("teacher_guide"), // pacing, prep, struggles, remediation
  capstoneProject: jsonb("capstone_project"), // title, objective, rubric, steps
  isPublished: boolean("is_published").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiLessons = pgTable(
  "ai_lessons",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => aiCourses.id),
    orderIndex: integer("order_index").notNull().default(1),
    slug: varchar("slug").notNull(),
    title: varchar("title").notNull(),
    estimatedDurationMinutes: integer("estimated_duration_minutes").default(45),
    tags: jsonb("tags").default([]),
    hook: text("hook").notNull(),
    conceptExplanation: text("concept_explanation").notNull(),
    workedExamples: jsonb("worked_examples").default([]),
    activity: jsonb("activity"), // materials, duration, steps, success criteria, facilitation notes
    discussionPrompts: jsonb("discussion_prompts").default([]),
    quiz: jsonb("quiz").default([]), // [{type, question, options, answer, explanation}]
    extension: text("extension"),
    realWorldConnection: text("real_world_connection"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("ai_lessons_course_slug_idx").on(table.courseId, table.slug),
    index("ai_lessons_course_order_idx").on(table.courseId, table.orderIndex),
  ],
);

export const aiLessonProgress = pgTable(
  "ai_lesson_progress",
  {
    id: serial("id").primaryKey(),
    studentId: varchar("student_id")
      .notNull()
      .references(() => users.id),
    courseId: integer("course_id")
      .notNull()
      .references(() => aiCourses.id),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => aiLessons.id),
    completed: boolean("completed").default(false),
    quizScore: decimal("quiz_score").default("0"),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [uniqueIndex("ai_lesson_progress_unique").on(table.studentId, table.courseId, table.lessonId)],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tutors: many(tutors),
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  creator: one(users, {
    fields: [tutors.creatorId],
    references: [users.id],
  }),
  content: many(tutorContent),
  sessions: many(chatSessions),
  analytics: many(tutorAnalytics),
}));

export const tutorContentRelations = relations(tutorContent, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorContent.tutorId],
    references: [tutors.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  tutor: one(tutors, {
    fields: [chatSessions.tutorId],
    references: [tutors.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const tutorAnalyticsRelations = relations(tutorAnalytics, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorAnalytics.tutorId],
    references: [tutors.id],
  }),
}));

export const aiCoursesRelations = relations(aiCourses, ({ one, many }) => ({
  creator: one(users, {
    fields: [aiCourses.createdBy],
    references: [users.id],
  }),
  lessons: many(aiLessons),
  progress: many(aiLessonProgress),
}));

export const aiLessonsRelations = relations(aiLessons, ({ one, many }) => ({
  course: one(aiCourses, {
    fields: [aiLessons.courseId],
    references: [aiCourses.id],
  }),
  progress: many(aiLessonProgress),
}));

export const aiLessonProgressRelations = relations(aiLessonProgress, ({ one }) => ({
  student: one(users, {
    fields: [aiLessonProgress.studentId],
    references: [users.id],
  }),
  course: one(aiCourses, {
    fields: [aiLessonProgress.courseId],
    references: [aiCourses.id],
  }),
  lesson: one(aiLessons, {
    fields: [aiLessonProgress.lessonId],
    references: [aiLessons.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const insertTutorSchema = createInsertSchema(tutors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutorContentSchema = createInsertSchema(tutorContent).omit({
  id: true,
  uploadedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  startedAt: true,
  lastActiveAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertAiCourseSchema = createInsertSchema(aiCourses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiLessonSchema = createInsertSchema(aiLessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiLessonProgressSchema = createInsertSchema(aiLessonProgress).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type Tutor = typeof tutors.$inferSelect;
export type InsertTutorContent = z.infer<typeof insertTutorContentSchema>;
export type TutorContent = typeof tutorContent.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type TutorAnalytics = typeof tutorAnalytics.$inferSelect;
export type InsertAiCourse = z.infer<typeof insertAiCourseSchema>;
export type AiCourse = typeof aiCourses.$inferSelect;
export type InsertAiLesson = z.infer<typeof insertAiLessonSchema>;
export type AiLesson = typeof aiLessons.$inferSelect;
export type InsertAiLessonProgress = z.infer<typeof insertAiLessonProgressSchema>;
export type AiLessonProgress = typeof aiLessonProgress.$inferSelect;
