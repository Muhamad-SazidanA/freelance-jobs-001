export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseHeadingsAndInjectIds(htmlContent: string): {
  modifiedContent: string;
  tocItems: TocItem[];
} {
  if (!htmlContent) {
    return { modifiedContent: '', tocItems: [] };
  }

  const tocItems: TocItem[] = [];
  const usedSlugs = new Set<string>();
  const headingRegex = /<h([23])([^>]*)>(.*?)<\/h\1>/gi;

  const modifiedContent = htmlContent.replace(
    headingRegex,
    (match, levelStr: string, attributes: string, innerContent: string) => {
      const level = parseInt(levelStr, 10);
      const rawText = innerContent.replace(/<[^>]*>/g, '').trim();
      if (!rawText) return match;

      const existingIdMatch = /id=["']([^"']+)["']/i.exec(attributes);
      let headingId = existingIdMatch ? existingIdMatch[1] : '';

      if (!headingId) {
        const baseSlug = slugifyText(rawText) || `heading-${tocItems.length + 1}`;
        headingId = baseSlug;
        let counter = 1;
        while (usedSlugs.has(headingId)) {
          headingId = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      usedSlugs.add(headingId);
      tocItems.push({ id: headingId, text: rawText, level });

      if (existingIdMatch) return match;
      const cleanAttributes = attributes.trim() ? ` ${attributes.trim()}` : '';
      return `<h${level} id="${headingId}"${cleanAttributes}>${innerContent}</h${level}>`;
    }
  );

  return { modifiedContent, tocItems };
}
