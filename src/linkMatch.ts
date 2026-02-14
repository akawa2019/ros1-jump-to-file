import * as vscode from 'vscode';

export class ROSDocumentLink extends vscode.DocumentLink {
    constructor(
        range: vscode.Range,
        public ros_pack: string,
        public ros_relative: string
    ) {
        super(range);
    }
}

const matchers: Array<RegExp> = [
    // $(find pkg_name)/relative/path
    /\$\(\s*find\s+([a-zA-Z0-9_]+)\s*\)\/([^\s"'<>]+)/g,
    // package://package_name/relative/path
    /package:\/\/([a-zA-Z0-9_]+)\/([^\s"'<>]+)/g,       
];

export function matchRosLink(lineNumber: number, line: string){
    const ret: Array<ROSDocumentLink> = [];
    for(const matcher of matchers){
        matcher.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = matcher.exec(line)) !== null){
            const start = match.index;
            const range = new vscode.Range(
                new vscode.Position(lineNumber, start),
                new vscode.Position(lineNumber, start + match[0].length)
            );
            ret.push(new ROSDocumentLink(range, match[1], match[2]));
        }
    }
    return ret;
}
