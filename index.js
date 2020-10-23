const fs = require('fs')
const youtubedl = require('youtube-dl')
const Discord = require('discord.js')
const firebase = require('firebase')

const client = new Discord.Client()

const assets = require('./assets')
const config = require('./config')


if (!firebase.apps.length) {
    firebase.initializeApp(config)
}

client.on('message', message => {
    const content = message.content

    if (content.includes(`${assets.prefix}download`)) {
        const link = content.split(' ')[1]

        if (link) {
            message.channel.send('Please wait...')

            try {
                let name

                const video = youtubedl(link, ['--format=18'], { cwd: __dirname })
                const path = `./videos/${new Date().getTime()}_${message.author.tag}.mp4`

                video.on('info', e => {
                    const size = Math.round(e.size / 1000000)

                    if (size >= 8) {
                        message.reply('Your video is too weight, try with another video')
                    } else {
                        message.channel.send(`Downloading **${e._filename}** video...`)
                        name = e._filename
                    }
                })

                video.on('end', () => {
                    message.author.send(`Here's your **${name}** video :raised_hands:`, {
                        files: [{
                            attachment: path,
                            name: name
                        }]
                    }).then(() => {
                        message.channel.send('Your video is now available in your direct messages :tada:')
                    })
                })

                video.pipe(fs.createWriteStream(path))
            } catch (error) {
                message.reply(`Add your youtube link : \`${assets.prefix}download <link>\``)
                console.log(error)
            }
        } else {
            message.reply(`Add your youtube link : \`${assets.prefix}download <link>\``)
        }
    }
})

client.on('ready', () => {
    client.user.setAvatar('./assets/icon.png')
    console.log('connected')
})

firebase.database().ref('dears/discord/').on('value', snapshot => {
    const jsonData = snapshot.toJSON()
    const token = jsonData.youtube_token

    client.login(token)
})