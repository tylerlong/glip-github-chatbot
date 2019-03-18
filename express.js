const createApp = require('ringcentral-chatbot/dist/apps').default
const { Service } = require('ringcentral-chatbot/dist/models')
const axios = require('axios')

const findService = async (bot, group) => {
  const service = await Service.findOne({ where: { name: 'GitHub', botId: bot.id, groupId: group.id } })
  return service
}

const buildQueryString = obj => {
  return Object.keys(obj).map(k => `${k}=${encodeURIComponent(obj[k])}`).join('&')
}

const sendAuthLink = async (bot, group) => {
  await bot.sendMessage(group.id, {
    text: `Please click [here](https://github.com/login/oauth/authorize?${buildQueryString({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.RINGCENTRAL_CHATBOT_SERVER + '/github/oauth',
      scope: 'read:user',
      state: `${group.id}:${bot.id}`
    })}) to authorize me to access your GitHub data.`
  })
}

const handle = async event => {
  if (event.type === 'BotJoinGroup') {
    const { bot, group } = event
    await bot.sendMessage(group.id, { text: 'Hello there' })
    await sendAuthLink(bot, group)
  }
  if (event.type === 'Message4Bot') {
    const { text, group, bot } = event
    const service = await findService(bot, group)
    if (service === null) {
      await sendAuthLink(bot, group)
      return
    }
    if (text === 'profile') {
      const r = await axios.get(`https://api.github.com/user?access_token=${service.data.accessToken}`)
      await bot.sendMessage(group.id, { text: `Here is your GitHub profile: [code]${JSON.stringify(r.data, null, 2)}[/code]` })
    } else {
      await bot.sendMessage(group.id, { text: 'I am sorry but I don\'t get it' })
    }
  }
}

const app = createApp(handle)

app.get('/github/oauth', async (req, res) => {
  const { code, state } = req.query
  const [groupId, botId] = state.split(':')
  const r = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    state,
    redirect_uri: process.env.RINGCENTRAL_CHATBOT_SERVER + '/github/oauth'
  })
  const accessToken = r.data.split('&')[0].split('=')[1]
  const service = await findService({ id: botId }, { id: groupId })
  if (service === null) {
    Service.create({ name: 'GitHub', groupId, botId, data: { accessToken } })
  } else {
    service.update({ data: { accessToken } })
  }
  res.send('Please close this page')
})

app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)
