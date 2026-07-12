import {
  users,
  tutors,
  tutorContent,
  chatSessions,
  chatMessages,
  tutorAnalytics,
  aiCourses,
  aiLessons,
  aiLessonProgress,
  type User,
  type UpsertUser,
  type Tutor,
  type InsertTutor,
  type TutorContent,
  type InsertTutorContent,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type TutorAnalytics,
  type AiCourse,
  type InsertAiCourse,
  type AiLesson,
  type InsertAiLesson,
  type AiLessonProgress,
  type InsertAiLessonProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sql, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for simple auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string, firstName?: string, lastName?: string): Promise<User>;
  
  // Tutor operations
  createTutor(tutor: InsertTutor): Promise<Tutor>;
  getTutorsByCreator(creatorId: string): Promise<Tutor[]>;
  getTutorById(id: number): Promise<Tutor | undefined>;
  getTutorByIdWithContent(id: number): Promise<(Tutor & { content: TutorContent[] }) | undefined>;
  updateTutor(id: number, updates: Partial<InsertTutor>): Promise<Tutor>;
  deleteTutor(id: number): Promise<void>;
  
  // Content operations
  addTutorContent(content: InsertTutorContent): Promise<TutorContent>;
  getTutorContent(tutorId: number): Promise<TutorContent[]>;
  deleteTutorContent(id: number): Promise<void>;
  
  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionToken: string): Promise<ChatSession | undefined>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  updateSessionActivity(sessionId: number): Promise<void>;
  
  // Analytics operations
  getTutorAnalytics(tutorId: number, days: number): Promise<TutorAnalytics[]>;
  getCreatorStats(creatorId: string): Promise<{
    totalTutors: number;
    totalSessions: number;
    totalMessages: number;
    avgSessionDuration: number;
  }>;
  
  // Subscription operations
  updateUserSubscription(userId: string, subscriptionTier: string): Promise<User>;
  
  // Subscription limit checks
  checkTutorLimit(creatorId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }>;
  checkContentLimit(tutorId: number): Promise<{ canAdd: boolean; currentCount: number; limit: number }>;

  // AI courses operations
  listPublishedAiCourses(): Promise<AiCourse[]>;
  listAllAiCourses(): Promise<AiCourse[]>;
  getAiCourseById(courseId: number): Promise<AiCourse | undefined>;
  getAiCourseWithLessons(courseId: number): Promise<(AiCourse & { lessons: AiLesson[] }) | undefined>;
  createAiCourse(course: InsertAiCourse): Promise<AiCourse>;
  updateAiCourse(courseId: number, updates: Partial<InsertAiCourse>): Promise<AiCourse>;
  deleteAiCourse(courseId: number): Promise<void>;
  createAiLesson(lesson: InsertAiLesson): Promise<AiLesson>;
  updateAiLesson(lessonId: number, updates: Partial<InsertAiLesson>): Promise<AiLesson>;
  deleteAiLesson(lessonId: number): Promise<void>;
  listAiLessonsByCourse(courseId: number): Promise<AiLesson[]>;

  // AI course progress operations
  upsertAiLessonProgress(progress: InsertAiLessonProgress): Promise<AiLessonProgress>;
  getAiLessonProgressForCourse(studentId: string, courseId: number): Promise<AiLessonProgress[]>;
  getAiLessonProgressForStudent(studentId: string): Promise<AiLessonProgress[]>;
}

export class DatabaseStorage implements IStorage {
  // Special users with free premium access
  private isSpecialUser(email: string | null): boolean {
    if (!email) return false;
    const specialEmails = [
      'yadavayush4239@gmail.com',
      'viveksolanki8013@gmail.com'
    ];
    return specialEmails.includes(email.toLowerCase());
  }

  // Get effective subscription tier (FREE PROMOTION: Everyone gets premium access)
  private getEffectiveSubscriptionTier(user: User): string {
    // FREE PROMOTION: Grant premium access to ALL users for 1 month
    return 'premium';
  }

  // User operations for simple auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      // FREE PROMOTION: Override subscription tier for ALL users
      return { ...user, subscriptionTier: 'premium' };
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (user) {
      // FREE PROMOTION: Override subscription tier for ALL users
      return { ...user, subscriptionTier: 'premium' };
    }
    return user;
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    // FREE PROMOTION: Override subscription tier for ALL users
    return { ...user, subscriptionTier: 'premium' };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string, firstName?: string, lastName?: string): Promise<User> {
    const updateData: any = {
      password: hashedPassword,
      updatedAt: new Date(),
    };
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }



  // Tutor operations
  async createTutor(tutor: InsertTutor): Promise<Tutor> {
    const [newTutor] = await db.insert(tutors).values(tutor).returning();
    return newTutor;
  }

  async getTutorsByCreator(creatorId: string): Promise<Tutor[]> {
    return await db
      .select()
      .from(tutors)
      .where(eq(tutors.creatorId, creatorId))
      .orderBy(desc(tutors.updatedAt));
  }

  async getTutorById(id: number): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
    return tutor;
  }

  async getTutorByIdWithContent(id: number): Promise<(Tutor & { content: TutorContent[] }) | undefined> {
    const tutor = await this.getTutorById(id);
    if (!tutor) return undefined;
    
    const content = await this.getTutorContent(id);
    return { ...tutor, content };
  }

  async updateTutor(id: number, updates: Partial<InsertTutor>): Promise<Tutor> {
    const [updatedTutor] = await db
      .update(tutors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tutors.id, id))
      .returning();
    return updatedTutor;
  }

  async deleteTutor(id: number): Promise<void> {
    // Delete related data first to avoid foreign key constraints
    await db.delete(tutorContent).where(eq(tutorContent.tutorId, id));
    
    // Get session IDs first, then delete messages
    const sessionIds = await db.select({ id: chatSessions.id }).from(chatSessions).where(eq(chatSessions.tutorId, id));
    for (const session of sessionIds) {
      await db.delete(chatMessages).where(eq(chatMessages.sessionId, session.id));
    }
    
    await db.delete(chatSessions).where(eq(chatSessions.tutorId, id));
    await db.delete(tutorAnalytics).where(eq(tutorAnalytics.tutorId, id));
    
    // Finally delete the tutor
    await db.delete(tutors).where(eq(tutors.id, id));
  }

  // Content operations
  async addTutorContent(content: InsertTutorContent): Promise<TutorContent> {
    const [newContent] = await db.insert(tutorContent).values(content).returning();
    return newContent;
  }

  async getTutorContent(tutorId: number): Promise<TutorContent[]> {
    return await db
      .select()
      .from(tutorContent)
      .where(eq(tutorContent.tutorId, tutorId));
  }

  async deleteTutorContent(id: number): Promise<void> {
    await db.delete(tutorContent).where(eq(tutorContent.id, id));
  }

  // Chat operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async getChatSession(sessionToken: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionToken, sessionToken));
    return session;
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update session activity and message count
    await db
      .update(chatSessions)
      .set({
        lastActiveAt: new Date(),
        messageCount: sql`message_count + 1`,
      })
      .where(eq(chatSessions.id, message.sessionId));
    
    return newMessage;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await db
      .update(chatSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(chatSessions.id, sessionId));
  }

  // Analytics operations
  async getTutorAnalytics(tutorId: number, days: number): Promise<TutorAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, tutorId),
          sql`date >= ${startDate}`
        )
      )
      .orderBy(tutorAnalytics.date);
  }

  async getCreatorStats(creatorId: string): Promise<{
    totalTutors: number;
    totalSessions: number;
    totalMessages: number;
    avgSessionDuration: number;
  }> {
    // Get total tutors
    const [tutorCount] = await db
      .select({ count: count() })
      .from(tutors)
      .where(eq(tutors.creatorId, creatorId));

    // Get session and message stats
    const stats = await db
      .select({
        totalSessions: count(chatSessions.id),
        totalMessages: sql<number>`COALESCE(SUM(${chatSessions.messageCount}), 0)`,
        avgDuration: avg(chatSessions.duration),
      })
      .from(tutors)
      .leftJoin(chatSessions, eq(chatSessions.tutorId, tutors.id))
      .where(eq(tutors.creatorId, creatorId));

    const [sessionStats] = stats;

    return {
      totalTutors: tutorCount.count,
      totalSessions: sessionStats.totalSessions,
      totalMessages: Number(sessionStats.totalMessages),
      avgSessionDuration: Number(sessionStats.avgDuration) || 0,
    };
  }

  async updateUserSubscription(userId: string, subscriptionTier: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        subscriptionTier,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async checkTutorLimit(creatorId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    const user = await this.getUser(creatorId);
    if (!user) throw new Error("User not found");

    const [result] = await db
      .select({ count: count() })
      .from(tutors)
      .where(eq(tutors.creatorId, creatorId));

    const currentCount = result.count;
    let limit: number;

    // Use effective subscription tier (includes special user override)
    const effectiveTier = this.getEffectiveSubscriptionTier(user);
    
    switch (effectiveTier) {
      case "free":
        limit = 1;
        break;
      case "pro":
        limit = 5;
        break;
      case "premium":
        limit = -1; // unlimited
        break;
      default:
        limit = 1;
    }

    return {
      canCreate: limit === -1 || currentCount < limit,
      currentCount,
      limit
    };
  }

  async checkContentLimit(tutorId: number): Promise<{ canAdd: boolean; currentCount: number; limit: number }> {
    const tutor = await this.getTutorById(tutorId);
    if (!tutor) throw new Error("Tutor not found");

    const user = await this.getUser(tutor.creatorId);
    if (!user) throw new Error("User not found");

    const [result] = await db
      .select({ count: count() })
      .from(tutorContent)
      .where(eq(tutorContent.tutorId, tutorId));

    const currentCount = result.count;
    let limit: number;

    // Use effective subscription tier (includes special user override)
    const effectiveTier = this.getEffectiveSubscriptionTier(user);

    switch (effectiveTier) {
      case "free":
        limit = 3;
        break;
      case "pro":
        limit = 10;
        break;
      case "premium":
        limit = -1; // unlimited
        break;
      default:
        limit = 3;
    }

    return {
      canAdd: limit === -1 || currentCount < limit,
      currentCount,
      limit
    };
  }

  async listPublishedAiCourses(): Promise<AiCourse[]> {
    return db
      .select()
      .from(aiCourses)
      .where(eq(aiCourses.isPublished, true))
      .orderBy(asc(aiCourses.band), asc(aiCourses.id));
  }

  async listAllAiCourses(): Promise<AiCourse[]> {
    return db
      .select()
      .from(aiCourses)
      .orderBy(asc(aiCourses.band), desc(aiCourses.updatedAt));
  }

  async getAiCourseById(courseId: number): Promise<AiCourse | undefined> {
    const [course] = await db.select().from(aiCourses).where(eq(aiCourses.id, courseId));
    return course;
  }

  async listAiLessonsByCourse(courseId: number): Promise<AiLesson[]> {
    return db
      .select()
      .from(aiLessons)
      .where(eq(aiLessons.courseId, courseId))
      .orderBy(asc(aiLessons.orderIndex), asc(aiLessons.id));
  }

  async getAiCourseWithLessons(courseId: number): Promise<(AiCourse & { lessons: AiLesson[] }) | undefined> {
    const course = await this.getAiCourseById(courseId);
    if (!course) return undefined;
    const lessons = await this.listAiLessonsByCourse(courseId);
    return { ...course, lessons };
  }

  async createAiCourse(course: InsertAiCourse): Promise<AiCourse> {
    const [created] = await db
      .insert(aiCourses)
      .values({
        ...course,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateAiCourse(courseId: number, updates: Partial<InsertAiCourse>): Promise<AiCourse> {
    const [updated] = await db
      .update(aiCourses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(aiCourses.id, courseId))
      .returning();
    return updated;
  }

  async deleteAiCourse(courseId: number): Promise<void> {
    const lessons = await this.listAiLessonsByCourse(courseId);
    for (const lesson of lessons) {
      await db.delete(aiLessonProgress).where(eq(aiLessonProgress.lessonId, lesson.id));
    }
    await db.delete(aiLessons).where(eq(aiLessons.courseId, courseId));
    await db.delete(aiLessonProgress).where(eq(aiLessonProgress.courseId, courseId));
    await db.delete(aiCourses).where(eq(aiCourses.id, courseId));
  }

  async createAiLesson(lesson: InsertAiLesson): Promise<AiLesson> {
    const [created] = await db
      .insert(aiLessons)
      .values({
        ...lesson,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateAiLesson(lessonId: number, updates: Partial<InsertAiLesson>): Promise<AiLesson> {
    const [updated] = await db
      .update(aiLessons)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(aiLessons.id, lessonId))
      .returning();
    return updated;
  }

  async deleteAiLesson(lessonId: number): Promise<void> {
    await db.delete(aiLessonProgress).where(eq(aiLessonProgress.lessonId, lessonId));
    await db.delete(aiLessons).where(eq(aiLessons.id, lessonId));
  }

  async upsertAiLessonProgress(progress: InsertAiLessonProgress): Promise<AiLessonProgress> {
    const [updated] = await db
      .insert(aiLessonProgress)
      .values({
        ...progress,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [aiLessonProgress.studentId, aiLessonProgress.courseId, aiLessonProgress.lessonId],
        set: {
          completed: progress.completed,
          quizScore: progress.quizScore,
          completedAt: progress.completedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updated;
  }

  async getAiLessonProgressForCourse(studentId: string, courseId: number): Promise<AiLessonProgress[]> {
    return db
      .select()
      .from(aiLessonProgress)
      .where(and(eq(aiLessonProgress.studentId, studentId), eq(aiLessonProgress.courseId, courseId)))
      .orderBy(asc(aiLessonProgress.lessonId));
  }

  async getAiLessonProgressForStudent(studentId: string): Promise<AiLessonProgress[]> {
    return db
      .select()
      .from(aiLessonProgress)
      .where(eq(aiLessonProgress.studentId, studentId))
      .orderBy(desc(aiLessonProgress.updatedAt));
  }
}

export const storage = new DatabaseStorage();
