import { 
  type User, 
  type InsertUser,
  type Settings,
  type InsertSettings,
  type Book,
  type InsertBook,
  type Outline,
  type InsertOutline,
  type Chapter,
  type InsertChapter,
  type BookIdea,
  type InsertBookIdea
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Settings operations  
  getSettings(userId: string): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: string, settings: Partial<InsertSettings>): Promise<Settings | undefined>;

  // Book operations
  getBook(id: string): Promise<Book | undefined>;
  getBooksByUserId(userId: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, updates: Partial<Omit<InsertBook, 'userId'>>): Promise<Book | undefined>;
  deleteBook(id: string): Promise<boolean>;

  // Outline operations
  getOutline(id: string): Promise<Outline | undefined>;
  getOutlineByBookId(bookId: string): Promise<Outline | undefined>;
  createOutline(outline: InsertOutline): Promise<Outline>;
  updateOutline(id: string, updates: Partial<Omit<InsertOutline, 'bookId'>>): Promise<Outline | undefined>;
  approveOutline(id: string): Promise<Outline | undefined>;

  // Chapter operations
  getChapter(id: string): Promise<Chapter | undefined>;
  getChaptersByBookId(bookId: string): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, updates: Partial<Omit<InsertChapter, 'bookId' | 'outlineId'>>): Promise<Chapter | undefined>;

  // Book idea operations
  getBookIdea(id: string): Promise<BookIdea | undefined>;
  getBookIdeasByUserId(userId: string): Promise<BookIdea[]>;
  createBookIdea(idea: InsertBookIdea): Promise<BookIdea>;
  deleteBookIdea(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private settings: Map<string, Settings>;
  private books: Map<string, Book>;
  private outlines: Map<string, Outline>;
  private chapters: Map<string, Chapter>;
  private bookIdeas: Map<string, BookIdea>;

  constructor() {
    this.users = new Map();
    this.settings = new Map();
    this.books = new Map();
    this.outlines = new Map();
    this.chapters = new Map();
    this.bookIdeas = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Settings operations
  async getSettings(userId: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = randomUUID();
    const now = new Date();
    const settings: Settings = { 
      ...insertSettings,
      userId: insertSettings.userId || null,
      openrouterApiKey: insertSettings.openrouterApiKey || null,
      selectedModel: insertSettings.selectedModel || null, 
      defaultGenre: insertSettings.defaultGenre || null,
      defaultWordCount: insertSettings.defaultWordCount || null,
      autoSave: insertSettings.autoSave || null,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: string, updates: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existing = await this.getSettings(userId);
    if (!existing) return undefined;

    const updated: Settings = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.settings.set(existing.id, updated);
    return updated;
  }

  // Book operations
  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksByUserId(userId: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(
      (book) => book.userId === userId
    ).sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const now = new Date();
    const book: Book = { 
      ...insertBook,
      status: insertBook.status || "idea",
      description: insertBook.description || null,
      targetAudience: insertBook.targetAudience || null, 
      keyPoints: insertBook.keyPoints || null,
      id,
      currentWordCount: 0,
      progress: 0,
      createdAt: now,
      updatedAt: now
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, updates: Partial<Omit<InsertBook, 'userId'>>): Promise<Book | undefined> {
    const existing = this.books.get(id);
    if (!existing) return undefined;

    const updated: Book = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.books.set(id, updated);
    return updated;
  }

  async deleteBook(id: string): Promise<boolean> {
    const deleted = this.books.delete(id);
    // Also delete related outlines and chapters
    Array.from(this.outlines.entries()).forEach(([outlineId, outline]) => {
      if (outline.bookId === id) {
        this.outlines.delete(outlineId);
      }
    });
    Array.from(this.chapters.entries()).forEach(([chapterId, chapter]) => {
      if (chapter.bookId === id) {
        this.chapters.delete(chapterId);
      }
    });
    return deleted;
  }

  // Outline operations
  async getOutline(id: string): Promise<Outline | undefined> {
    return this.outlines.get(id);
  }

  async getOutlineByBookId(bookId: string): Promise<Outline | undefined> {
    return Array.from(this.outlines.values()).find(
      (outline) => outline.bookId === bookId
    );
  }

  async createOutline(insertOutline: InsertOutline): Promise<Outline> {
    const id = randomUUID();
    const now = new Date();
    const outline: Outline = { 
      bookId: insertOutline.bookId,
      title: insertOutline.title,
      chapters: insertOutline.chapters,
      totalChapters: insertOutline.totalChapters,
      totalEstimatedWords: insertOutline.totalEstimatedWords,
      id,
      isApproved: false,
      approvedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.outlines.set(id, outline);
    return outline;
  }

  async updateOutline(id: string, updates: Partial<Omit<InsertOutline, 'bookId'>>): Promise<Outline | undefined> {
    const existing = this.outlines.get(id);
    if (!existing) return undefined;

    const updated: Outline = {
      bookId: existing.bookId,
      title: updates.title || existing.title,
      chapters: updates.chapters || existing.chapters,
      totalChapters: updates.totalChapters || existing.totalChapters,
      totalEstimatedWords: updates.totalEstimatedWords || existing.totalEstimatedWords,
      id: existing.id,
      isApproved: existing.isApproved,
      approvedAt: existing.approvedAt,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    };
    this.outlines.set(id, updated);
    return updated;
  }

  async approveOutline(id: string): Promise<Outline | undefined> {
    const existing = this.outlines.get(id);
    if (!existing) return undefined;

    const now = new Date();
    const updated: Outline = {
      ...existing,
      isApproved: true,
      approvedAt: now,
      updatedAt: now
    };
    this.outlines.set(id, updated);
    
    // Update book status to approved
    await this.updateBook(existing.bookId, { status: "approved" });
    
    return updated;
  }

  // Chapter operations
  async getChapter(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async getChaptersByBookId(bookId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter((chapter) => chapter.bookId === bookId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = randomUUID();
    const now = new Date();
    const chapter: Chapter = { 
      bookId: insertChapter.bookId,
      outlineId: insertChapter.outlineId,
      chapterNumber: insertChapter.chapterNumber,
      title: insertChapter.title,
      status: insertChapter.status || "pending",
      id,
      content: insertChapter.content || null,
      wordCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: string, updates: Partial<Omit<InsertChapter, 'bookId' | 'outlineId'>>): Promise<Chapter | undefined> {
    const existing = this.chapters.get(id);
    if (!existing) return undefined;

    // Calculate word count if content is being updated
    const wordCount = updates.content ? 
      updates.content.trim().split(/\s+/).filter(word => word.length > 0).length : 
      (existing.wordCount || 0);

    const updated: Chapter = {
      ...existing,
      ...updates,
      wordCount,
      updatedAt: new Date()
    };
    this.chapters.set(id, updated);
    
    // Update book's current word count
    if (updates.content !== undefined) {
      const allChapters = await this.getChaptersByBookId(existing.bookId);
      const totalWords = allChapters.reduce((sum, ch) => sum + (ch.id === id ? wordCount : ch.wordCount || 0), 0);
      
      const book = await this.getBook(existing.bookId);
      if (book) {
        const progress = Math.min(Math.round((totalWords / book.targetWordCount) * 100), 100);
        const updatedBook = { 
          ...book,
          currentWordCount: totalWords, 
          progress,
          status: progress === 100 ? "completed" : "writing",
          updatedAt: new Date()
        };
        this.books.set(existing.bookId, updatedBook);
      }
    }
    
    return updated;
  }

  // Book idea operations
  async getBookIdea(id: string): Promise<BookIdea | undefined> {
    return this.bookIdeas.get(id);
  }

  async getBookIdeasByUserId(userId: string): Promise<BookIdea[]> {
    return Array.from(this.bookIdeas.values())
      .filter((idea) => idea.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createBookIdea(insertBookIdea: InsertBookIdea): Promise<BookIdea> {
    const id = randomUUID();
    const bookIdea: BookIdea = { 
      userId: insertBookIdea.userId,
      title: insertBookIdea.title,
      description: insertBookIdea.description,
      genre: insertBookIdea.genre,
      targetAudience: insertBookIdea.targetAudience || null,
      keyPoints: insertBookIdea.keyPoints || null,
      id,
      isSelected: false,
      createdAt: new Date()
    };
    this.bookIdeas.set(id, bookIdea);
    return bookIdea;
  }

  async deleteBookIdea(id: string): Promise<boolean> {
    return this.bookIdeas.delete(id);
  }
}

export const storage = new MemStorage();
