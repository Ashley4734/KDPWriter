import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSettingsSchema,
  insertBookSchema,
  insertOutlineSchema, 
  insertChapterSchema,
  insertBookIdeaSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // For now, we'll use a hardcoded user ID (in real app, this would come from authentication)
  const DEMO_USER_ID = "demo-user";

  // Create a demo user if it doesn't exist
  const existingUser = await storage.getUser(DEMO_USER_ID);
  if (!existingUser) {
    await storage.createUser({ 
      id: DEMO_USER_ID,
      username: "demo", 
      password: "demo" 
    } as any);
  }

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await storage.getSettings(DEMO_USER_ID);
      
      if (!settings) {
        // Create default settings if none exist
        settings = await storage.createSettings({
          userId: DEMO_USER_ID,
          openrouterApiKey: null,
          selectedModel: null,
          defaultGenre: "Business",
          defaultWordCount: 50000,
          autoSave: true
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(DEMO_USER_ID, validatedData);
      
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Book endpoints
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooksByUserId(DEMO_USER_ID);
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.updateBook(req.params.id, req.body);
      
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ error: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBook(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Outline endpoints
  app.get("/api/books/:bookId/outline", async (req, res) => {
    try {
      const outline = await storage.getOutlineByBookId(req.params.bookId);
      
      if (!outline) {
        return res.status(404).json({ error: "Outline not found" });
      }
      
      res.json(outline);
    } catch (error) {
      console.error("Error fetching outline:", error);
      res.status(500).json({ error: "Failed to fetch outline" });
    }
  });

  app.post("/api/books/:bookId/outline", async (req, res) => {
    try {
      const validatedData = insertOutlineSchema.parse({
        ...req.body,
        bookId: req.params.bookId
      });
      
      const outline = await storage.createOutline(validatedData);
      
      // Update book status to outline
      await storage.updateBook(req.params.bookId, { status: "outline" });
      
      res.status(201).json(outline);
    } catch (error) {
      console.error("Error creating outline:", error);
      res.status(500).json({ error: "Failed to create outline" });
    }
  });

  app.put("/api/outlines/:id", async (req, res) => {
    try {
      const outline = await storage.updateOutline(req.params.id, req.body);
      
      if (!outline) {
        return res.status(404).json({ error: "Outline not found" });
      }
      
      res.json(outline);
    } catch (error) {
      console.error("Error updating outline:", error);
      res.status(500).json({ error: "Failed to update outline" });
    }
  });

  app.post("/api/outlines/:id/approve", async (req, res) => {
    try {
      const outline = await storage.approveOutline(req.params.id);
      
      if (!outline) {
        return res.status(404).json({ error: "Outline not found" });
      }
      
      res.json(outline);
    } catch (error) {
      console.error("Error approving outline:", error);
      res.status(500).json({ error: "Failed to approve outline" });
    }
  });

  // Chapter endpoints
  app.get("/api/books/:bookId/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChaptersByBookId(req.params.bookId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getChapter(req.params.id);
      
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  app.post("/api/books/:bookId/chapters", async (req, res) => {
    try {
      const validatedData = insertChapterSchema.parse({
        ...req.body,
        bookId: req.params.bookId
      });
      
      const chapter = await storage.createChapter(validatedData);
      res.status(201).json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ error: "Failed to create chapter" });
    }
  });

  app.put("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.updateChapter(req.params.id, req.body);
      
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ error: "Failed to update chapter" });
    }
  });

  // Book Ideas endpoints
  app.get("/api/book-ideas", async (req, res) => {
    try {
      const ideas = await storage.getBookIdeasByUserId(DEMO_USER_ID);
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching book ideas:", error);
      res.status(500).json({ error: "Failed to fetch book ideas" });
    }
  });

  app.post("/api/book-ideas", async (req, res) => {
    try {
      const validatedData = insertBookIdeaSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      
      const idea = await storage.createBookIdea(validatedData);
      res.status(201).json(idea);
    } catch (error) {
      console.error("Error creating book idea:", error);
      res.status(500).json({ error: "Failed to create book idea" });
    }
  });

  app.delete("/api/book-ideas/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBookIdea(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Book idea not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting book idea:", error);
      res.status(500).json({ error: "Failed to delete book idea" });
    }
  });

  // AI Generation endpoints (will implement these in the next task)
  app.post("/api/generate-ideas", async (req, res) => {
    try {
      // TODO: Implement AI idea generation using OpenRouter
      res.status(501).json({ error: "AI idea generation not yet implemented" });
    } catch (error) {
      console.error("Error generating ideas:", error);
      res.status(500).json({ error: "Failed to generate ideas" });
    }
  });

  app.post("/api/generate-outline", async (req, res) => {
    try {
      // TODO: Implement AI outline generation using OpenRouter  
      res.status(501).json({ error: "AI outline generation not yet implemented" });
    } catch (error) {
      console.error("Error generating outline:", error);
      res.status(500).json({ error: "Failed to generate outline" });
    }
  });

  app.post("/api/generate-chapter", async (req, res) => {
    try {
      // TODO: Implement AI chapter generation using OpenRouter
      res.status(501).json({ error: "AI chapter generation not yet implemented" });
    } catch (error) {
      console.error("Error generating chapter:", error);
      res.status(500).json({ error: "Failed to generate chapter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
