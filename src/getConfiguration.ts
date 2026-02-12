import * as vscode from 'vscode';

export const CONFIG_ROOT_KEY = "ros1JumpToFile";
export const SETUP_FILE_KEY = "setupFile";
export const SUPPORTED_EXT_KEY = "supportedExtensions";
export const USER_OVERRIDE_KEY = 'packageOverrides';


export async function getSetupFile(){
    const setupFile = vscode.workspace.getConfiguration(CONFIG_ROOT_KEY).get<string>(SETUP_FILE_KEY, "");
    if(setupFile.length){
        try{
            await vscode.workspace.fs.stat(vscode.Uri.file(setupFile));
        }catch{
            vscode.window.showErrorMessage(`Config "${CONFIG_ROOT_KEY}.${SETUP_FILE_KEY}:\n Could not find file ${setupFile}"`);
            return "";
        }
    }
    return setupFile;
}

export function getSupportedExtensions(){
    return vscode.workspace.getConfiguration(CONFIG_ROOT_KEY).get<Array<string>>(SUPPORTED_EXT_KEY, []);
}

export function getUserOverride(){
    return vscode.workspace.getConfiguration(CONFIG_ROOT_KEY).get<Record<string, string>>(USER_OVERRIDE_KEY, {});
}