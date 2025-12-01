# Change Log


## [1.1.0] - 2025-12-01
- Added `createIfNotExist` property to file configuration for better file handling:
	- If `append` is true and `createIfNotExist` is true, the file will be created and written if it does not exist.
	- If `createIfNotExist` is false, append will only work if the file already exists.
- Updated documentation in README to reflect new property and provide improved examples.
- Enhanced file creation and append logic in extension for improved behavior and logging.
- Updated extension metadata in `package.json`:
	- Added `icon.png` and publisher info.
	- Bumped version to 1.1.0.
	- Updated author field.
- Added `icon.png` to the project.

## [1.0.0] - 2025-11-18
- Initial release
	- Project scaffolding and configuration
	- Core extension code in `src/extension.ts`
	- ESLint, TypeScript, and VS Code settings
	- Documentation and license