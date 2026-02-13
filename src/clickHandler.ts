import * as vscode from 'vscode';
import * as path from 'path';
import {CacheManager} from './cacheManager';
import {getRosPackageFromShell} from "./getRosPackagePath";
import { getSetupFile, getSupportedExtensions } from "./getConfiguration";

class ROSDocumentLink extends vscode.DocumentLink {
    constructor(
        range: vscode.Range,
        public ros_pack: string,
        public ros_relative: string
    ) {
        super(range);
    }
}


export class ROSPathClickHandler{
    private static readonly ROS_PATH_REGEX = /\$\(\s*find\s+([a-zA-Z0-9_]+)\s*\)\/([^\s"'<>]+)/g;

    private cacheManager: CacheManager;
    private registration: vscode.Disposable | undefined;
    private context: vscode.ExtensionContext;

    private readonly provider: vscode.DocumentLinkProvider = {
        provideDocumentLinks: (document, _token) => {
            const links: vscode.DocumentLink[] = [];
            for(let lineNumber=0; lineNumber<document.lineCount; ++lineNumber){
                const line = document.lineAt(lineNumber).text;
                ROSPathClickHandler.ROS_PATH_REGEX.lastIndex = 0;
                let match: RegExpExecArray | null;
                while ((match = ROSPathClickHandler.ROS_PATH_REGEX.exec(line)) !== null){
                    const start = match.index;
                    const range = new vscode.Range(
                        new vscode.Position(lineNumber, start),
                        new vscode.Position(lineNumber, start + match[0].length)
                    );
                    links.push(new ROSDocumentLink(range, match[1], match[2]));
                }
            }
            return links;
        },

        resolveDocumentLink: async (link, _token) => {
            if(!(link instanceof ROSDocumentLink)) return link;
            const pack = (link as ROSDocumentLink).ros_pack;
            const relative = (link as ROSDocumentLink).ros_relative;
            const abs_pack_uri = this.cacheManager.resolve(pack);
            if(!abs_pack_uri){
                const refreshButton = { title: "Refresh Cache" };
                const selection = await vscode.window.showWarningMessage("Cannot resolve rospack: " + pack, refreshButton);
                if(selection === refreshButton){
                    await this.reloadCache();
                }
                return link;
            }
            const furi = vscode.Uri.file(path.join(abs_pack_uri, relative));
            try{
                await vscode.workspace.fs.stat(furi);
            }catch{
                vscode.window.showWarningMessage("Invalid file path: " + furi.path);
                return link;
            }
            link.target = furi;
            return link;
        }
    };

    constructor(context: vscode.ExtensionContext, cacheManager: CacheManager) {
        this.context = context;
        this.cacheManager = cacheManager;
        this.registerClickHandler();
    }

    private registerClickHandler() {
        const extensionType = getSupportedExtensions();
        const pattern = extensionType.length ? `**/*.{${extensionType.join(",")}}` : '**/*';
        if(this.registration) this.registration.dispose();
        this.context.subscriptions.push(
            vscode.languages.registerDocumentLinkProvider({ scheme: 'file', pattern: pattern}, this.provider)
        );
    }

    public async reloadCache(){
        const setupFile = getSetupFile();
        const pairs = await getRosPackageFromShell(setupFile);
        const pkgs = Object.keys(pairs).length;
        if(pkgs){
            await this.cacheManager.writeAutoCache(pairs);
            vscode.window.showInformationMessage(`Successfully load ${pkgs} packages from ${setupFile}`);
        }else{
            vscode.window.showWarningMessage(`Cannot load packages from ${setupFile}`);
        }
        this.registerClickHandler();
    }
}