const createApp = require('ringcentral-chatbot/dist/apps').default

const handle = async event => {
  if (event.type === 'BotJoinGroup') {
    const { bot, group } = event
    await bot.sendMessage(group.id, { text: 'Hello there' })
  }
  if (event.type === 'Message4Bot') {
    const { text, group, bot } = event
    if (text === 'ping') {
      await bot.sendMessage(group.id, { text: 'pong' })
    }
  }
}

const app = createApp(handle)
app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)
