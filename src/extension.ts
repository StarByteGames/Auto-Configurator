import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

let outputChannel: vscode.OutputChannel;

function log(msg: string) {
  if (!outputChannel) {
    return;
  }
  outputChannel.appendLine(`[Auto Configurator] ${msg}`);
}

outputChannel = vscode.window.createOutputChannel("Auto Configurator");
log("extension activated.");

const config = vscode.workspace.getConfiguration("autoConfigurator");
const files: {
  path: string;
  content?: string;
  append?: boolean;
  createIfNotExist?: boolean;
  rules?: { type: string; value: string }[];
}[] = config.get("files", []);
const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
async function checkRule(rule: {
  type: string;
  value: string;
}): Promise<boolean> {
  log(`[Rule] Checking rule: ${JSON.stringify(rule)}`);
  try {
    switch (rule.type) {
      case "fileNotExists": {
        const abs = workspaceRoot
          ? path.join(workspaceRoot, rule.value)
          : rule.value;
        const result = !fs.existsSync(abs);
        outputChannel.appendLine(`[Rule] fileNotExists: ${abs} => ${result}`);
        log(`[Rule] fileNotExists: ${abs} => ${result}`);
        return result;
      }
      case "envVarSet": {
        const result = !!process.env[rule.value];
        outputChannel.appendLine(
          `[Rule] envVarSet: ${rule.value} => ${result}`
        );
        log(`[Rule] envVarSet: ${rule.value} => ${result}`);
        return result;
      }
      case "fileExistsGlob": {
        const files = await vscode.workspace.findFiles(
          rule.value,
          "**/node_modules/**",
          1
        );
        const result = files.length > 0;
        outputChannel.appendLine(
          `[Rule] fileExistsGlob: ${rule.value} => ${result}`
        );
        log(`[Rule] fileExistsGlob: ${rule.value} => ${result}`);
        return result;
      }
      case "folderExists": {
        const abs = workspaceRoot
          ? path.join(workspaceRoot, rule.value)
          : rule.value;
        const result = fs.existsSync(abs) && fs.lstatSync(abs).isDirectory();
        outputChannel.appendLine(`[Rule] folderExists: ${abs} => ${result}`);
        log(`[Rule] folderExists: ${abs} => ${result}`);
        return result;
      }
      case "settingEquals": {
        const idx = rule.value.indexOf("=");
        if (idx === -1) {
          outputChannel.appendLine(
            `[Rule] settingEquals: Malformed value: ${rule.value}`
          );
          log(`[Rule] settingEquals: Malformed value: ${rule.value}`);
          return false;
        }
        const key = rule.value.substring(0, idx);
        const expected = rule.value.substring(idx + 1);
        const actual = vscode.workspace.getConfiguration().get(key);
        const result = String(actual) === expected;
        outputChannel.appendLine(
          `[Rule] settingEquals: ${key} == ${expected} (actual: ${actual}) => ${result}`
        );
        log(`[Rule] settingEquals: ${key} == ${expected} (actual: ${actual}) => ${result}`);
        return result;
      }
      case "fileContains": {
        const idx = rule.value.indexOf("|");
        if (idx === -1) {
          outputChannel.appendLine(
            `[Rule] fileContains: Malformed value: ${rule.value}`
          );
          log(`[Rule] fileContains: Malformed value: ${rule.value}`);
          return false;
        }
        const relPath = rule.value.substring(0, idx);
        const search = rule.value.substring(idx + 1);
        const abs = workspaceRoot ? path.join(workspaceRoot, relPath) : relPath;
        if (!fs.existsSync(abs)) {
          outputChannel.appendLine(
            `[Rule] fileContains: File does not exist: ${abs}`
          );
          log(`[Rule] fileContains: File does not exist: ${abs}`);
          return false;
        }
        const content = fs.readFileSync(abs, "utf8");
        const result = content.includes(search);
        outputChannel.appendLine(
          `[Rule] fileContains: ${abs} contains "${search}" => ${result}`
        );
        log(`[Rule] fileContains: ${abs} contains "${search}" => ${result}`);
        return result;
      }
      case "workspaceName": {
        if (!vscode.workspace.workspaceFolders) {
          outputChannel.appendLine(
            `[Rule] workspaceName: No workspace folders`
          );
          log(`[Rule] workspaceName: No workspace folders`);
          return false;
        }
        const name = vscode.workspace.workspaceFolders[0].name;
        const result = name === rule.value;
        outputChannel.appendLine(
          `[Rule] workspaceName: ${name} == ${rule.value} => ${result}`
        );
        log(`[Rule] workspaceName: ${name} == ${rule.value} => ${result}`);
        return result;
      }
      default:
        outputChannel.appendLine(`[Rule] Unknown rule type: ${rule.type}`);
        log(`[Rule] Unknown rule type: ${rule.type}`);
        return false;
    }
  } catch (err: any) {
    outputChannel.appendLine(
      `[Rule] Error checking rule: ${err?.message || err}`
    );
    log(`[Rule] Error checking rule: ${err?.message || err}`);
    return false;
  }
}
async function ensureFiles() {
  if (workspaceRoot && files.length > 0) {
    outputChannel.appendLine(`[Files] Ensuring files as per configuration...`);
    log(`[Files] Ensuring files as per configuration...`);
    for (const file of files) {
      const absFile = path.join(workspaceRoot, file.path);
      let shouldCreate = true;
      if (file.rules && Array.isArray(file.rules)) {
        outputChannel.appendLine(`[Files] Checking rules for: ${file.path}`);
        log(`[Files] Checking rules for: ${file.path}`);
        const results = await Promise.all(file.rules.map(checkRule));
        shouldCreate = results.every(Boolean);
        outputChannel.appendLine(
          `[Files] Rule results for ${file.path}: ${results.join(
            ", "
          )} => shouldCreate: ${shouldCreate}`
        );
        log(`[Files] Rule results for ${file.path}: ${results.join(", ")} => shouldCreate: ${shouldCreate}`);
      }
      if (shouldCreate && !fs.existsSync(absFile)) {
        try {
          const dir = path.dirname(absFile);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            outputChannel.appendLine(`[Files] Created directory: ${dir}`);
            log(`[Files] Created directory: ${dir}`);
          }
          if (file.append) {
            if (file.createIfNotExist) {
              fs.writeFileSync(absFile, file.content ?? "", { encoding: "utf8" });
              outputChannel.appendLine(`[Files] Created file (append+createIfNotExist): ${absFile}`);
              log(`[Files] Created file (append+createIfNotExist): ${absFile}`);
            } else {
              outputChannel.appendLine(`[Files] Skipped append: file does not exist and createIfNotExist is false: ${absFile}`);
              log(`[Files] Skipped append: file does not exist and createIfNotExist is false: ${absFile}`);
            }
          } else {
            fs.writeFileSync(absFile, file.content ?? "", { encoding: "utf8" });
            outputChannel.appendLine(`[Files] Created file: ${absFile}`);
            log(`[Files] Created file: ${absFile}`);
          }
        } catch (err: any) {
          outputChannel.appendLine(
            `[Files] Error creating/appending file ${absFile}: ${err?.message || err}`
          );
          log(`[Files] Error creating/appending file ${absFile}: ${err?.message || err}`);
        }
      } else if (shouldCreate && fs.existsSync(absFile) && file.append) {
        try {
          const existing = fs.readFileSync(absFile, "utf8");
          if (file.content && existing.includes(file.content)) {
            outputChannel.appendLine(`[Files] Content already present in file: ${absFile}`);
            log(`[Files] Content already present in file: ${absFile}`);
          } else {
            fs.appendFileSync(absFile, file.content ?? "", { encoding: "utf8" });
            outputChannel.appendLine(`[Files] Appended to existing file: ${absFile}`);
            log(`[Files] Appended to existing file: ${absFile}`);
          }
        } catch (err: any) {
          outputChannel.appendLine(
            `[Files] Error appending to file ${absFile}: ${err?.message || err}`
          );
          log(`[Files] Error appending to file ${absFile}: ${err?.message || err}`);
        }
      } else if (!shouldCreate) {
        outputChannel.appendLine(
          `[Files] Skipped file (rules not met): ${file.path}`
        );
        log(`[Files] Skipped file (rules not met): ${file.path}`);
      } else {
        outputChannel.appendLine(`[Files] File already exists: ${file.path}`);
        log(`[Files] File already exists: ${file.path}`);
      }
    }
  } else {
    outputChannel.appendLine(
      `[Files] No files to ensure or workspace root not found.`
    );
    log(`[Files] No files to ensure or workspace root not found.`);
  }
}
ensureFiles();

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine("Auto Configurator extension deactivated.");
    log("extension deactivated.");
    outputChannel.dispose();
  }
}
