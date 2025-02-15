---

# Quatrell, o Auditor

## [2.1.0] - 2025-02-15

### Added
- Created `/corrigir` command to fix incorrect XP, gold and gem logs.
- Created an entry for `/corrigir` in the user manual. 

## [2.0.2] - 2025-02-12

### Added
- Introduced a `Sanitizer` class for input sanitization.

### Changed
- Refactored slash commands: moved channel and quantity declarations to top level.
- Updated interaction author and target fetch methods from `getMember()` to `getUser()`.
- Removed redundant code by eliminating unnecessary repetitions.
- Centralized character input sanitization logic in the new `Sanitizer` class.

## [2.0.1] - 2025-02-01

### Fixed
- Resolved invalid token issue in the production environment.
- Fixed incorrect channel ID indexing.

## [2.0.0] - 2025-02-01

### Added
- Type definitions for Player properties.

### Changed
- **Breaking Change**: Migrated project language from JavaScript to TypeScript.
- **Breaking Change**: Switched package manager from npm to pnpm.
- Restructured project folders into `src` and `dist` directories.
- Updated package scripts to align with the new project structure.

### Removed
- Replaced `PM2` with `tsx` for TypeScript development.

## [1.0.2] - 2025-02-01

### Added
- Readme file.
- Package scripts for development and build processes.
- `PM2` module for process management during development.
- Dotenv module for handling environment variables.

### Changed
- Converted config file to a CommonJS module.
- Moved Firebase app configuration to the Firestore queries library.

### Removed
- Obsolete text and manual files.
- ESLint module and its configuration files.

## [1.0.1] - 2024-08-31

### Changed
- Refactored `/listar` command to list all player characters in a single message.
- Updated `config.json` structure for streamlined development and testing.
- Refactored commands to align with the new config structure.

### Fixed
- Fixed role-specific command issues for Administrators and Moderators.
- Corrected tier emoji display during character creation.
- Applied code linting fixes.

## [1.0.0] - 2024-08-21

### Added
- Initial release with core functionality.

---