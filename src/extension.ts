import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('extension.alignTokens',
                                                               alignTokens);
    context.subscriptions.push(disposable);
}

export function deactivate() {
}

async function alignTokens(textEditor: vscode.TextEditor,
                           edit: vscode.TextEditorEdit,
                           ...args: any[]) {
    vscode.window.showInputBox({ prompt: 'Provide text to align:',
                                 value: '=' }).then(token => {
        if (token !== undefined && token.length > 0) {
            let selection = textEditor.selection;

            // If there is no selection, do the job for the whole file
            if (selection.start.line === selection.end.line) {
                selection = new vscode.Selection(0, 0, textEditor.document.lineCount - 1, 0);
            }

            let farthestPosition = findFarthestPosition(selection, token);
            if (farthestPosition !== -1) {
                alignAccordingToFarthestPosition(selection, token, farthestPosition);
            }
        }
    });

    function findFarthestPosition(selection: vscode.Selection, token: string) {
        let farestPosition = -1;
        for (let lineNo = selection.start.line; lineNo <= selection.end.line; ++lineNo) {
            let lineText = textEditor.document.lineAt(lineNo).text;
            let foundAt  = lineText.indexOf(token);
            if (foundAt > farestPosition) {
                farestPosition = foundAt;
            }
        }
        return farestPosition;
    }

    function alignAccordingToFarthestPosition(selection: vscode.Selection,
                                              token: string,
                                              farthestPosition: number) {
        textEditor.edit(editBuilder => {
            for (let lineNo = selection.start.line; lineNo <= selection.end.line; ++lineNo) {
                let line     = textEditor.document.lineAt(lineNo);
                let lineText = line.text;
                let foundAt  = lineText.indexOf(token);
                if (foundAt !== -1) {
                    lineText = lineText.substring(0, foundAt) +
                               ' '.repeat(farthestPosition - foundAt) +
                               lineText.substring(foundAt);
                    editBuilder.replace(line.range, lineText);
                }
            }
        });
    }
}
