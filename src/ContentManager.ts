import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import ContentFile from "./ContentFile.js";
import config from './config.js';

function debugPrint(message: string) {
    console.error(`DEBUG: ${message}`);
};

class ContentManager {
    private contentDirs: string[];
    private dirToFiles: Record<string, string[]>;
    private pathToContent: Record<string, ContentFile>;

    constructor() {
        this.contentDirs = [config.celsDirectory];
        this.dirToFiles = {};
        this.pathToContent = {};
        this.loadContent();

        debugPrint(`Content manager initialized with ${this.contentDirs[0]} directories`);
    }

    loadContent() {
        this.dirToFiles = {};
        this.pathToContent = {};

        for (const contentDir of this.contentDirs) {
            if (!fs.existsSync(contentDir) || !fs.statSync(contentDir).isDirectory()) {
                debugPrint(`Warning: ${contentDir} is not a valid directory, skipping`);
                continue;
            }

            const mdFiles = this._findMarkdownFiles(contentDir);
            this.dirToFiles[contentDir] = mdFiles;
            debugPrint(`Found ${mdFiles.length} markdown files in ${contentDir}`);

            for (const filePath of mdFiles) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const { meta, data } = this._parseMarkdown(content);
                    this.pathToContent[filePath] = new ContentFile(
                        filePath,
                        meta,
                        data
                    );
                } catch (e) {
                    debugPrint(`Error processing ${filePath}: ${e}`);
                }
            }
        }

        debugPrint(`Total files processed: ${Object.keys(this.pathToContent).length}`);
    }

    _findMarkdownFiles(dir: string) {
        const result: string[] = [];
        const walkDir = (currentPath: string) => {
            const files = fs.readdirSync(currentPath);
            for (const file of files) {
                const filePath = path.join(currentPath, file);
                const stat = fs.statSync(filePath);
                if (stat.isFile() && file.endsWith('.md')) {
                    result.push(filePath);
                } else if (stat.isDirectory()) {
                    walkDir(filePath);
                }
            }
        };
        walkDir(dir);
        return result;
    }

    _formatContentForOutput(contentFiles: ContentFile[]) {
        if (!contentFiles || contentFiles.length === 0) {
            return "No matching content found.";
        }

        const result = [];

        for (let i = 0; i < contentFiles.length; i++) {
            const file = contentFiles[i];
            result.push(`File: ${file.path}`);
            result.push("Metadata:");
            for (const [key, value] of Object.entries(file.meta)) {
                result.push(`  ${key}: ${value}`);
            }

            // Include the full content
            result.push("Content:");
            result.push(file.data.trim());

            // Add separator between entries, but not after the last one
            if (i < contentFiles.length - 1) {
                result.push("-".repeat(50));
            }
        }

        return result.join("\n");
    }

    _normalizeTags(tags: string[] | string) {
        if (tags === null || tags === undefined) {
            return [];
        }

        if (Array.isArray(tags)) {
            return tags.map(tag => String(tag).trim());
        }

        if (typeof tags === 'string') {
            // If it looks like a YAML list
            if (tags.startsWith('[') && tags.endsWith(']')) {
                const inner = tags.slice(1, -1).trim();
                if (!inner) {
                    return [];
                }
                return inner
                    .split(',')
                    .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
            }

            // If it's a comma-separated string
            if (tags.includes(',')) {
                return tags.split(',').map(tag => tag.trim());
            }

            // Single tag
            return [tags.trim()];
        }

        // Any other type, convert to string and return as single item
        return [String(tags)];
    }

    _parseMarkdown(content: string) {
        const frontMatterPattern = /^---\s*\n(.*?)\n---\s*\n/s;
        const match = content.match(frontMatterPattern);

        if (!match) {
            return { meta: {}, data: content };
        }

        const frontMatterText = match[1];

        // Use js-yaml to properly parse the front matter
        try {
            const meta = yaml.load(frontMatterText) || {};

            // Ensure meta is an object
            if (typeof meta !== 'object' || meta === null) {
                return { meta: {}, data: content.slice(match[0].length) };
            }

            // Ensure tags are always in list format
            if ('tags' in meta && meta.tags !== null) {
                if (!Array.isArray(meta.tags)) {
                    meta.tags = [meta.tags];
                }
            }

            // Extract the actual content (everything after front matter)
            const data = content.slice(match[0].length);

            return { meta, data };
        } catch (e) {
            debugPrint(`YAML parsing error: ${e}`);
            return { meta: {}, data: content.slice(match[0].length) };
        }
    }

    getByTag(tag: string) {
        const matches: ContentFile[] = [];
        const tagLower = tag.toLowerCase();

        debugPrint(`Searching for tag: '${tagLower}'`);
        for (const [filePath, contentFile] of Object.entries(this.pathToContent)) {
            const rawTags = contentFile.meta.tags || [];
            const tags = this._normalizeTags(rawTags);

            // Debug
            if (tags.length) {
                debugPrint(`File: ${path.basename(filePath)} - Tags: ${tags}`);
            }

            // Check for exact tag match (case insensitive)
            if (tags.some(t => tagLower === t.toLowerCase())) {
                debugPrint(`Found exact tag match in ${path.basename(filePath)}`);
                matches.push(contentFile);
                continue;
            }

            // Check if the tag is part of a tag
            for (const t of tags) {
                if (t.toLowerCase().includes(tagLower)) {
                    debugPrint(`Found partial tag match in ${path.basename(filePath)}: '${t}'`);
                    matches.push(contentFile);
                    break;
                }
            }
        }

        debugPrint(`Found ${matches.length} files with tag '${tag}'`);

        return this._formatContentForOutput(matches);
    }

    searchTags(tagQuery: string) {
        const allTags = new Set();
        const tagQueryLower = tagQuery.toLowerCase();

        debugPrint(`Searching for tags containing: '${tagQueryLower}'`);
        for (const [_, contentFile] of Object.entries(this.pathToContent)) {
            const rawTags = contentFile.meta.tags || [];
            const tags = this._normalizeTags(rawTags);

            // Add tags that match the query
            for (const tag of tags) {
                if (tag.toLowerCase().includes(tagQueryLower)) {
                    allTags.add(tag);
                }
            }
        }

        // Convert to array and sort alphabetically
        const tagList = Array.from(allTags).sort();
        debugPrint(`Found ${tagList.length} tags matching '${tagQueryLower}'`);

        return tagList;
    }

    listAllTags(): string {
        const tagInfo: Record<string, number> = {};

        debugPrint("Collecting tag statistics...");
        for (const [_, contentFile] of Object.entries(this.pathToContent)) {
            const rawTags = contentFile.meta.tags || [];
            const tags = this._normalizeTags(rawTags);

            for (const tag of tags) {
                if (tag in tagInfo) {
                    let count = tagInfo[tag];
                    tagInfo[tag] = count + 1;
                } else {
                    tagInfo[tag] = 1;
                }
            }
        }

        // Convert to array of tuples [tag, count, latestDate]
        const result = Object.entries(tagInfo).map(([tag, count]) => [tag, count]);

        // Sort by count (descending) and then by date (most recent first)
        result.sort((a, b) => {
            const countA = a[1] as number;
            const countB = b[1] as number;

            if (countB !== countA) {
                return countB - countA;
            }
            return countA - countB;
        });

        return result.map(tag => tag[0]).join(', ');
    }
}

export default ContentManager;