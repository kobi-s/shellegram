const { execSync } = require("child_process");
const Os = require("os")

const getCurrentDirectory = function(os) {
    if(os == 'win32') {
        return execSync('cd').toString()
    }

    if(os == 'linux' || os == 'macOS') {
        return execSync('pwd').toString()
    }
}

const handleShellCommand = async function(bot, msg) {
    try {
        const response = await execSync(msg.text)
        if(response == '') {
            return 'Command completed'
        }

        if(response.length > 4096) {
            for (let i = 0; i < response.length; i+=4096) {
                const slice = response.slice(i, i+4096);
                bot.sendMessage(msg.chat.id, slice)
            }
        } else {
            return bot.sendMessage(msg.chat.id, response.toString())
        }
        
    } catch (error) {
        return bot.sendMessage(msg.chat.id, error.toString())
    }
}

const handleUploader = async function(bot, msg) {
    try {
        
        let location = getCurrentDirectory(await Os.platform())

        return bot.sendMessage(msg.chat.id, `Drag the file here and access it from\n${location.toString()}\nOr change position by setting in the file caption `, {
            reply_markup: {
                keyboard: [
                    [{text: 'Back'}]
                ],
                force_reply: true,
                resize_keyboard: true
            }
        })
    } catch (error) {
        return bot.sendMessage(msg.chat.id, error.toString())
    }
}

module.exports = {
    getCurrentDirectory,
    handleShellCommand,
    handleUploader
}