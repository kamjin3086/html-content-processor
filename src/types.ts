/**
 * Type for Markdown generation results.
 */
export interface MarkdownGenerationResult {
  /** Raw Markdown output. */
  rawMarkdown: string;
  /** Markdown output with link citations. */
  markdownWithCitations: string;
  /** Markdown for the references section. */
  referencesMarkdown: string;
  /** Markdown generated from filtered HTML. */
  fitMarkdown: string;
  /** Filtered HTML content. */
  fitHtml: string;
}

/**
 * Options for HTML to text conversion.
 */
export interface Html2TextOptions {
  /** Text width for line wrapping; 0 means no wrapping. */
  bodyWidth?: number;
  /** Whether to ignore emphasis (bold, italic). */
  ignoreEmphasis?: boolean;
  /** Whether to ignore links. */
  ignoreLinks?: boolean;
  /** Whether to ignore images. */
  ignoreImages?: boolean;
  /** Whether to protect links from being converted (e.g., keep them as is). */
  protectLinks?: boolean;
  /** Whether to use a single newline for line breaks instead of double. */
  singleLineBreak?: boolean;
  /** Whether to mark code blocks. */
  markCode?: boolean;
  /** Whether to escape special Markdown characters. */
  escapeSnob?: boolean;
  /** Whether to skip internal links (e.g., #anchor). */
  skipInternalLinks?: boolean;
  /** Whether to include superscript and subscript tags. */
  includeSuperSub?: boolean;
} 