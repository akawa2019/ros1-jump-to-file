import * as vscode from 'vscode';
import * as path from 'path';
import {CacheManager} from './cacheManager';
import {getRosPackageFromShell} from "./getRosPackagePath";
import { getSetupFile, getSupportedExtensions } from "./getConfiguration";
import { ROSDocumentLink, matchRosLink } from "./linkMatch";


export class ROSPathClickHandler{

    private cacheManager: CacheManager;
    private registration: vscode.Disposable | undefined;
    private context: vscode.ExtensionContext;

    private readonly provider: vscode.DocumentLinkProvider = {
        provideDocumentLinks: (document, _token) => {
            const links: vscode.DocumentLink[] = [];
            for(let lineNumber=0; lineNumber<document.lineCount; ++lineNumber){
                const line = document.lineAt(lineNumber).text;
                links.push(...matchRosLink(lineNumber, line));
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
        const setupFile = await getSetupFile();
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