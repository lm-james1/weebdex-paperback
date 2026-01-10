import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    MangaStatus,
    MangaTile,
    SourceInfo,
    RequestManager,
    SourceCategory
} from "paperback-extensions-common";

export const WeebdexInfo: SourceInfo = {
    version: "1.0.0",
    name: "Weebdex",
    description: "Read manga from Weebdex.org",
    author: "You",
    icon: "icon.png", // optional: put an icon here
    authorWebsite: "https://weebdex.org",
    websiteBaseURL: "https://weebdex.org",
    contentRating: 13,
    language: "en",
    sourceTags: [
        {
            text: "API",
            type: "api"
        }
    ]
};

export const Weebdex = (): Source => {
    const requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000
    });

    // ---------- SEARCH ----------
    const search = async (query: string): Promise<MangaTile[]> => {
        const url = `https://weebdex.org/api/manga?title=${encodeURIComponent(query)}&limit=20`;

        const request = createRequestObject({
            url,
            method: 'GET'
        });

        const data = await requestManager.schedule(request, 1);
        const json = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;

        const mangaTiles: MangaTile[] = json.results.map((m: any) => {
            return createMangaTile({
                id: m.id,
                title: m.title,
                image: m.cover
            });
        });

        return mangaTiles;
    };

    // ---------- MANGA DETAILS ----------
    const getMangaDetails = async (mangaId: string): Promise<Manga> => {
        const url = `https://weebdex.org/api/manga/${mangaId}`;

        const request = createRequestObject({
            url,
            method: 'GET'
        });

        const data = await requestManager.schedule(request, 1);
        const json = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;

        return createManga({
            id: json.id,
            titles: [json.title],
            image: json.cover,
            status: json.completed ? MangaStatus.COMPLETED : MangaStatus.ONGOING,
            author: json.authors?.join(", ") || "Unknown",
            tags: json.genres || [],
            desc: json.description || "",
            rating: 0
        });
    };

    // ---------- CHAPTER LIST ----------
    const getChapters = async (mangaId: string): Promise<Chapter[]> => {
        const url = `https://weebdex.org/api/manga/${mangaId}/chapters`;

        const request = createRequestObject({
            url,
            method: 'GET'
        });

        const data = await requestManager.schedule(request, 1);
        const json = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;

        return json.chapters.map((c: any) => createChapter({
            id: c.id,
            mangaId: mangaId,
            chapNum: parseFloat(c.number) || 0,
            title: c.title,
            langCode: 'en',
            time: new Date(c.date).getTime()
        }));
    };

    // ---------- CHAPTER DETAILS ----------
    const getChapterDetails = async (mangaId: string, chapterId: string): Promise<ChapterDetails> => {
        const url = `https://weebdex.org/api/chapter/${chapterId}`;

        const request = createRequestObject({
            url,
            method: 'GET'
        });

        const data = await requestManager.schedule(request, 1);
        const json = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;

        return createChapterDetails({
            id: chapterId,
            mangaId,
            pages: json.pages, // array of image URLs
            longStrip: false
        });
    };

    return {
        requestManager,
        search,
        getMangaDetails,
        getChapters,
        getChapterDetails
    };
};