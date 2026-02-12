// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CacheManager } from './cacheManager';
import { ROSPathClickHandler } from './clickHandler';
import { CONFIG_ROOT_KEY, USER_OVERRIDE_KEY, SUPPORTED_EXT_KEY } from "./getConfiguration";

let cacheManager: CacheManager | undefined;
let clickHandler: ROSPathClickHandler | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	cacheManager = new CacheManager(context);
	clickHandler = new ROSPathClickHandler(context, cacheManager);
	registerCommands(context);
	registerConfigWatcher(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}


function registerCommands(context: vscode.ExtensionContext) {
	const refreshCommand = vscode.commands.registerCommand(
        CONFIG_ROOT_KEY + '.refreshCache',
        async () => {
			await clickHandler?.reloadCache();
        }
    );
    context.subscriptions.push(refreshCommand);
}

function registerConfigWatcher(context: vscode.ExtensionContext) {
	const disposable = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration(CONFIG_ROOT_KEY + "." + USER_OVERRIDE_KEY)) {
            cacheManager?.loadUserCache();
            vscode.window.showInformationMessage("User package overrides reloaded.");
        }
        if (event.affectsConfiguration(CONFIG_ROOT_KEY + "." + SUPPORTED_EXT_KEY)) {
			const refreshButton = { title: "Reload Window" };
            const result = await vscode.window.showInformationMessage(
                "Extension list changed. Please reload window to apply.",
				refreshButton
            );
			if(result === refreshButton){
				await vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
        }
    });

    context.subscriptions.push(disposable);
}