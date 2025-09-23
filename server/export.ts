import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import puppeteer from "puppeteer"
import JSZip from "jszip"
import { storage } from "./storage"
import type { Book, Chapter, Outline } from "@shared/schema"

export interface ExportOptions {
  format: "docx" | "pdf" | "txt" | "epub"
  pageSize: "letter" | "a4" | "kindle"
  includeTableOfContents: boolean
  includeMetadata: boolean
  amazonKdpFormatting?: boolean
}

export interface ExportResult {
  filename: string
  buffer: Buffer
  mimeType: string
}

export class BookExportService {
  async exportBook(bookId: string, options: ExportOptions): Promise<ExportResult> {
    // Get book data
    const book = await storage.getBook(bookId)
    if (!book) {
      throw new Error("Book not found")
    }

    if (book.status !== "completed") {
      throw new Error("Book must be completed before export")
    }

    // Get chapters
    const chapters = await storage.getChaptersByBookId(bookId)
    if (!chapters || chapters.length === 0) {
      throw new Error("No chapters found for book")
    }

    // Get outline for structure
    const outline = await storage.getOutlineByBookId(bookId)

    // Sort chapters by number
    const sortedChapters = chapters.sort((a, b) => a.chapterNumber - b.chapterNumber)

    // Generate export based on format
    switch (options.format) {
      case "docx":
        return this.exportToDocx(book, sortedChapters, outline, options)
      case "pdf":
        return this.exportToPdf(book, sortedChapters, outline, options)
      case "txt":
        return this.exportToText(book, sortedChapters, outline, options)
      case "epub":
        return this.exportToEpub(book, sortedChapters, outline, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  private async exportToDocx(
    book: Book,
    chapters: Chapter[],
    outline: Outline | undefined,
    options: ExportOptions
  ): Promise<ExportResult> {
    const doc = new Document({
      sections: [
        {
          children: [
            // Title page
            new Paragraph({
              children: [
                new TextRun({
                  text: book.title,
                  bold: true,
                  size: 48,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Author and metadata
            ...(options.includeMetadata ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Genre: ${book.genre}`,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Target Audience: ${book.targetAudience || "General"}`,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Word Count: ${book.currentWordCount} words`,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
            ] : []),

            // Table of contents (if enabled)
            ...(options.includeTableOfContents ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Table of Contents",
                    bold: true,
                    size: 32,
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
              }),
              ...chapters.map((chapter, index) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 100 },
                })
              ),
              new Paragraph({ text: "", spacing: { after: 400 } }),
            ] : []),

            // Chapters content
            ...chapters.flatMap((chapter) => [
              // Chapter title
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
                    bold: true,
                    size: 32,
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
              }),
              
              // Chapter content - split by paragraphs
              ...this.parseContentToParagraphs(chapter.content || "").map(
                (text) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text,
                        size: 24,
                      }),
                    ],
                    spacing: { after: 200 },
                  })
              ),
            ]),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)
    
    return {
      filename: `${this.sanitizeFilename(book.title)}.docx`,
      buffer,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
  }

  private async exportToPdf(
    book: Book,
    chapters: Chapter[],
    outline: Outline | undefined,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Generate HTML content
    const htmlContent = this.generateHTML(book, chapters, outline, options)
    
    // Use puppeteer to generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-features=VizDisplayCompositor'
      ]
    })
    
    try {
      const page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
      // Configure page settings based on pageSize
      const pageConfig = this.getPageConfig(options.pageSize)
      
      const pdfBuffer = await page.pdf({
        format: pageConfig.format as any,
        printBackground: true,
        margin: {
          top: '1in',
          bottom: '1in',
          left: '1in',
          right: '1in',
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%;">
            <span class="pageNumber"></span>
          </div>
        `,
      })

      return {
        filename: `${this.sanitizeFilename(book.title)}.pdf`,
        buffer: Buffer.from(pdfBuffer),
        mimeType: "application/pdf",
      }
    } finally {
      await browser.close()
    }
  }

  private async exportToText(
    book: Book,
    chapters: Chapter[],
    outline: Outline | undefined,
    options: ExportOptions
  ): Promise<ExportResult> {
    let content = ""
    
    // Title and metadata
    content += `${book.title}\n`
    content += "=".repeat(book.title.length) + "\n\n"
    
    if (options.includeMetadata) {
      content += `Genre: ${book.genre}\n`
      content += `Target Audience: ${book.targetAudience || "General"}\n`
      content += `Word Count: ${book.currentWordCount} words\n\n`
    }

    // Table of contents
    if (options.includeTableOfContents) {
      content += "TABLE OF CONTENTS\n"
      content += "-".repeat(17) + "\n\n"
      chapters.forEach((chapter) => {
        content += `Chapter ${chapter.chapterNumber}: ${chapter.title}\n`
      })
      content += "\n\n"
    }

    // Chapters
    chapters.forEach((chapter, index) => {
      if (index > 0) content += "\n\n"
      
      content += `Chapter ${chapter.chapterNumber}: ${chapter.title}\n`
      content += "-".repeat(`Chapter ${chapter.chapterNumber}: ${chapter.title}`.length) + "\n\n"
      content += chapter.content || ""
      content += "\n"
    })

    return {
      filename: `${this.sanitizeFilename(book.title)}.txt`,
      buffer: Buffer.from(content, "utf-8"),
      mimeType: "text/plain",
    }
  }

  private async exportToEpub(
    book: Book,
    chapters: Chapter[],
    outline: Outline | undefined,
    options: ExportOptions
  ): Promise<ExportResult> {
    const zip = new JSZip()
    
    // EPUB structure
    zip.file("mimetype", "application/epub+zip")
    
    // META-INF
    const metaInf = zip.folder("META-INF")!
    metaInf.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)

    // OEBPS
    const oebps = zip.folder("OEBPS")!
    
    // Content.opf
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${book.title}</dc:title>
    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">BookGen AI</dc:creator>
    <dc:identifier id="bookid" xmlns:dc="http://purl.org/dc/elements/1.1/">${book.id}</dc:identifier>
    <dc:language xmlns:dc="http://purl.org/dc/elements/1.1/">en</dc:language>
    <dc:subject xmlns:dc="http://purl.org/dc/elements/1.1/">${book.genre}</dc:subject>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${chapters.map(ch => `<item id="ch${ch.chapterNumber}" href="chapter${ch.chapterNumber}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${chapters.map(ch => `<itemref idref="ch${ch.chapterNumber}"/>`).join('\n    ')}
  </spine>
</package>`
    
    oebps.file("content.opf", contentOpf)

    // Create chapter files
    chapters.forEach((chapter) => {
      const chapterContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${chapter.title}</title>
</head>
<body>
  <h1>Chapter ${chapter.chapterNumber}: ${chapter.title}</h1>
  ${this.parseContentToHTML(chapter.content || "")}
</body>
</html>`
      
      oebps.file(`chapter${chapter.chapterNumber}.xhtml`, chapterContent)
    })

    const buffer = await zip.generateAsync({ type: "nodebuffer" })
    
    return {
      filename: `${this.sanitizeFilename(book.title)}.epub`,
      buffer,
      mimeType: "application/epub+zip",
    }
  }

  private generateHTML(
    book: Book,
    chapters: Chapter[],
    outline: Outline | undefined,
    options: ExportOptions
  ): string {
    const amazonKdpStyles = options.amazonKdpFormatting ? `
      body { 
        font-family: 'Times New Roman', serif; 
        font-size: 12pt; 
        line-height: 1.6; 
        text-align: justify;
        margin: 0;
        padding: 0;
      }
      h1 { 
        font-size: 18pt; 
        font-weight: bold; 
        text-align: center; 
        page-break-before: always;
        margin-top: 2em;
        margin-bottom: 1em;
      }
      h2 { 
        font-size: 14pt; 
        font-weight: bold; 
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      p { 
        margin-bottom: 1em; 
        text-indent: 0.5in;
        orphans: 2;
        widows: 2;
      }
      .title-page {
        page-break-after: always;
        text-align: center;
        margin-top: 3in;
      }
      .title {
        font-size: 24pt;
        font-weight: bold;
        margin-bottom: 2em;
      }
      .toc {
        page-break-after: always;
      }
      .chapter {
        page-break-before: always;
      }
    ` : `
      body { 
        font-family: Georgia, serif; 
        font-size: 12pt; 
        line-height: 1.6; 
        max-width: 6.5in;
        margin: 0 auto;
        padding: 1in;
      }
      h1 { 
        font-size: 18pt; 
        margin-top: 2em; 
        margin-bottom: 1em; 
      }
      h2 { 
        font-size: 14pt; 
        margin-top: 1.5em; 
        margin-bottom: 0.5em; 
      }
      p { 
        margin-bottom: 1em; 
      }
    `

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${book.title}</title>
      <style>
        ${amazonKdpStyles}
      </style>
    </head>
    <body>
      <div class="title-page">
        <div class="title">${book.title}</div>
        ${options.includeMetadata ? `
          <p>Genre: ${book.genre}</p>
          <p>Target Audience: ${book.targetAudience || "General"}</p>
          <p>Word Count: ${book.currentWordCount} words</p>
        ` : ''}
      </div>
      
      ${options.includeTableOfContents ? `
        <div class="toc">
          <h1>Table of Contents</h1>
          ${chapters.map(ch => `
            <p>Chapter ${ch.chapterNumber}: ${ch.title}</p>
          `).join('')}
        </div>
      ` : ''}
      
      ${chapters.map(chapter => `
        <div class="chapter">
          <h1>Chapter ${chapter.chapterNumber}: ${chapter.title}</h1>
          ${this.parseContentToHTML(chapter.content || "")}
        </div>
      `).join('')}
    </body>
    </html>
    `
  }

  private parseContentToParagraphs(content: string): string[] {
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim())
  }

  private parseContentToHTML(content: string): string {
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => `<p>${this.escapeHtml(line.trim())}</p>`)
      .join('\n')
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  private getPageConfig(pageSize: string) {
    switch (pageSize) {
      case "a4":
        return { format: "A4" }
      case "kindle":
        return { format: "A5" } // Close to 6x9 inches
      case "letter":
      default:
        return { format: "Letter" }
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 100)
  }
}

export const bookExportService = new BookExportService()