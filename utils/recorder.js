const recordScreen = require('record-screen')
let recording

const startRecording = (config) => {
    recording = recordScreen(config.path, {
        resolution: '1920x1080'
    })
    recording.promise
        .then(result => {
            process.stdout.write(result.stdout)
            process.stderr.write(result.stderr)
        })
        .catch(error => {
            // Screen recording has failed
            console.error(error)
        })
}

const stopRecording = () => {
    if (recording) {
        setTimeout(() => recording.stop(), 1000)
    }
}

module.exports = {
    startRecording,
    stopRecording
}