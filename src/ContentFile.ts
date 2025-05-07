import path from 'path';

// ContentFile class (equivalent to Python dataclass)
export default class ContentFile {
    path: string;
    meta: any;
    data: string;

    constructor(path: string, meta: any, data: string) {
        this.path = path;
        this.meta = meta || {};
        this.data = data || '';
    }

    // Extract slug from metadata or from filename
    get slug() {
        if (this.meta.slug) {
            return String(this.meta.slug);
        }

        // Extract from filename (basename without extension)
        const filename = path.basename(this.path);
        return path.parse(filename).name;
    }

    // Extract URL from metadata if available
    get url() {
        if (this.meta.url) {
            return String(this.meta.url);
        }
        return null;
    }
}