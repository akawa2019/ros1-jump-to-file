import * as vscode from 'vscode';
import {getUserOverride} from "./getConfiguration";

export class CacheManager{

    private static readonly AUTO_CACHE_KEY = 'rosAutoPackageCache';

    private readonly context: vscode.ExtensionContext;
    private autoCache: Map<string, string> = new Map();
    private userCache: Map<string, string> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadAutoCache();
        this.loadUserCache();
    }

    /** 
     * Resolve package name form cache, user's override has privilege
     */
    public resolve(pkgName: string): string | undefined {
        const userPath = this.userCache.get(pkgName);
        if (userPath) return userPath;
        return this.autoCache.get(pkgName);
    }

    /**
     * Write autoCache to workspaceState (Old Data Will Be Cleaned), meanwhile reset autoCache in memory
     */
    public async writeAutoCache(newPairs: Record<string, string>): Promise<void> {
        this.autoCache = new Map(Object.entries(newPairs));
        await this.context.workspaceState.update(
            CacheManager.AUTO_CACHE_KEY,
            Object.fromEntries(this.autoCache)
        );
    }

    /**
     * Load / reload autoCache from workspaceState
     */
    public loadAutoCache(): void {
        const raw = this.context.workspaceState.get<Record<string, string>>(
            CacheManager.AUTO_CACHE_KEY,
            {}
        );
        this.autoCache = new Map(Object.entries(raw));
    }

    /**
     * Load / reload user's override from settings.json
     */
    public loadUserCache(): void {
        const overrides = getUserOverride();
        this.userCache = new Map(Object.entries(overrides));
    }
}

