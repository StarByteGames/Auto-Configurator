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
		"rules": [
			{ "type": "fileExistsGlob", "value": ".csharpierrc" }
		]
	}
]
```
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
- `folderExists`: Folder exists.
- `settingEquals`: VS Code setting equals a value (`key=value`).
- `fileContains`: File contains a string (`relativePath|searchString`).
- `workspaceName`: Workspace folder name matches.

## Output
			An array of file configuration objects. Each object can have:
			- `path` (string, required): File path relative to the workspace root.
			- `content` (string, optional): Content to write or append.
			- `append` (boolean, optional): If true, appends content instead of overwriting.
			- `createIfNotExist` (boolean, optional): If true and `append` is set, the file will be created and written if it does not exist. If false, append will only work if the file already exists.
			- `rules` (array, optional): List of rules that must be met for the file to be created/appended.
All actions and rule checks are logged to the "Auto Configurator" output channel in VS Code.

## License

MIT

---

**Enjoy using Auto Configurator!**
