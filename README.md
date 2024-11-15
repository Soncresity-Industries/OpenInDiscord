# OpenInDiscord Safari Extension

A Safari extension that redirects Discord links to open in the Discord app on iOS.

## Features

- Open Discord links directly in the Discord app
- Configurable banner or instant opening behavior
- Supports different types of Discord URLs:
  - Invite links (discord.gg and discord.com/invite)
  - User profiles
  - Channels
  - Favorites

### Project Structure

- `content.js`: Main content script that handles URL detection and redirection
- `popup.html/js`: Extension settings UI
- `banner.css`: Styles for the "Open in App" banner
- `_locales`: Localization files

### Building

1. Open the project in Xcode
2. Select your target device/simulator
3. Build and run the project

## License

© Adrian Castro 2024. All rights reserved.
