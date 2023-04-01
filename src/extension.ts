import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('extension.alignTokens', alignTokens);
    context.subscriptions.push(disposable);
}

async function alignTokens(textEditor: vscode.TextEditor,
    edit: vscode.TextEditorEdit,
    ...args: any[]) {
    vscode.window.showInputBox({
        prompt: 'Provide text to align:',
        value: '='
    }).then(token => {
        if (token !== undefined && token.length > 0) {
            let selections = textEditor.selections;

            // If there is no selection, do the job for the whole file
            if (selections.length === 1 && selections[0].start.line === selections[0].end.line) {
                textEditor.selection = new vscode.Selection(0, 0, textEditor.document.lineCount - 1, 0);
            }

            let farthestPosition = findFarthestPosition(selections, token);
            if (farthestPosition !== -1) {
                alignAccordingToFarthestPosition(selections, token, farthestPosition);
            }
        }
    });

    function findFarthestPosition(selections: readonly vscode.Selection[], token: string) {
        let fathestPosition = -1;
        for (let selection of selections) {
            for (let lineNo = selection.start.line; lineNo <= selection.end.line; ++lineNo) {
                let lineText = textEditor.document.lineAt(lineNo).text;
                let foundAt = lineText.indexOf(token);
                if (foundAt > fathestPosition) {
                    fathestPosition = foundAt;
                }
            }
        }
        return fathestPosition;
    }

    function alignAccordingToFarthestPosition(selections: readonly vscode.Selection[],
        token: string,
        farthestPosition: number) {
        textEditor.edit(editBuilder => {
            for (let selection of selections) {
                for (let lineNo = selection.start.line; lineNo <= selection.end.line; ++lineNo) {
                    let line = textEditor.document.lineAt(lineNo);
                    let lineText = line.text;
                    let foundAt = lineText.indexOf(token);
                    if (foundAt !== -1) {
                        lineText = lineText.substring(0, foundAt) +
                            ' '.repeat(farthestPosition - foundAt) +
                            lineText.substring(foundAt);
                        editBuilder.replace(line.range, lineText);
                    }
                }
            }
        });
    }
}
