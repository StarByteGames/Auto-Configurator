# Auto Configurator

Auto Configurator is a Visual Studio Code extension that automatically ensures specific configuration files exist in your workspace, based on customizable rules. This helps you maintain consistent project settings and environment files across your team or multiple projects.

## Features

- Automatically creates or appends to files in your workspace based on rules you define.
- Supports conditional file creation using rules such as:
	- File existence (glob or direct path)
	- Folder existence
	- Environment variable presence
	- VS Code setting values
	- File content matching
	- Workspace folder name
- Appends content to files only if not already present.
- Logs all actions to the "Auto Configurator" output channel.

## Getting Started

1. Install the extension in VS Code.
2. Add configuration to your workspace settings (`.vscode/settings.json` or user settings):

```json
{
  "autoConfigurator.files": [
    {
      "path": ".csharpierrc",
      "content": "{\"printWidth\": 120}",
      "rules": [
        { "type": "fileExistsGlob", "value": "**/*.csproj" }
      ]
    },
    {
      "path": ".gitignore",
      "content": "\n.csharpierrc",
      "append": true,
      "createIfNotExist": true,
      "rules": [
        { "type": "fileExistsGlob", "value": ".csharpierrc" }
      ]
    }
  ]
}
```

## Configuration
- `path`: File path relative to the workspace root.
- `content`: Content to write or append.
- `append`: If true, appends content instead of overwriting.
- `createIfNotExist`: If true and `append` is set, create the file if missing.
- `rules`: List of conditions that must be met before creating/appending.

Supported rule types:
- `fileNotExists`: File does not exist.
- `envVarSet`: Environment variable is set.
- `fileExistsGlob`: Any file matching the glob exists.
- `folderExists`: Folder exists.
- `settingEquals`: VS Code setting equals a value (`key=value`).
- `fileContains`: File contains a string (`relativePath|searchString`).
- `workspaceName`: Workspace folder name matches.

## Output
All actions and rule checks are logged to the "Auto Configurator" output channel in VS Code.

## License

MIT

---

**Enjoy using Auto Configurator!**
