# Shellegram

Encrypted C&C channel with Telegram bot.

The following features are currently supported:
- CLI - execute commands
- Upload & Download files
- Screenshots
- Video capture

## Installation
1. Clone this repo and run `npm install`
2. Create bot with [BotFather](https://telegram.me/BotFather) or use [Telegram instractions](https://telegram.org/blog/bot-revolution) to create one.
3. Place your secret key in `config/config.sample` and change the file extension to `json`

## Packaging
Using [pkg](https://github.com/vercel/pkg) enables you to package this project into an executable that can be run on devices without Node.js installed.

```
npm install -g pkg
```
After installing it, from the project directory run `pkg index.js`. This will create executable for Linux, macOS and Windows. You can see more options using `pkg --help` command.


