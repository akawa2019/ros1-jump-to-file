import { execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(execFile);

/**
 * Get packages from shell's "$ROS_PACKAGE_PATH" environment variable, will source "setupFile" if set
 */
export async function getRosPackageFromShell(setupFile?: string|null): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const cmd = setupFile && setupFile.length
        ? `[ -f "${setupFile}" ] && source "${setupFile}"; rospack list`
        : "rospack list";
    let rosPackagePath: Array<string>;
    try{
        rosPackagePath = (await execAsync(
            "bash", 
            ["-c", cmd], 
            {encoding: 'utf-8', maxBuffer:10*1024*1024}
        )).stdout.trim().split("\n");
    }catch{
        return result;
    }
    for(const line of rosPackagePath){
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            result[parts[0]] = parts[1];
        }
    }
    return result;
}