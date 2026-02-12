import * as vscode from 'vscode';

export const CONFIG_ROOT_KEY = "ros1JumpToFile";
export const SETUP_FILE_KEY = "setupFile";
export const SUPPORTED_EXT_KEY = "supportedExtensions";
export const USER_OVERRIDE_KEY = 'packageOverrides';


const config = vscode.workspace.getConfiguration(CONFIG_ROOT_KEY);

export function getSetupFile(){
    return config.get<string>(SETUP_FILE_KEY, "");
}

export function getSupportedExtensions(){
    return config.get<Array<string>>(SUPPORTED_EXT_KEY, []);
}

export function getUserOverride(){
    return config.get<Record<string, string>>(USER_OVERRIDE_KEY, {});
}