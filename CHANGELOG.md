# Quatrell, o Auditor

## [1.0.2] - 2025-02-01

### Added
- Readme file.
- Package scripts for development and build processes.
- PM2 module for process management during development.
- Dotenv module for handling environment variables.

### Changed
- Converted the config file into a CommonJS module.
- Moved Firebase app configuration to the Firestore queries library file.

### Removed
- Unused text files.
- Obsolete manual files.
- Removed ESLint module and its configuration files.

## [1.0.1] - 2024-08-31

### Changed
- The `/listar` command now lists all player characters in a single message.
- Updated `config.json` structure for easier development and testing.
- Refactored all relevant commands to align with the new config structure.

### Fixed
- Fixed an issue where Administrators and Moderators couldn't use certain role-specific commands.
- Corrected character tier display to use the proper emoji during character creation.
- Applied code linting fixes.

## [1.0.0] - 2024-08-21

### Added
- Initial release with core functionality.
