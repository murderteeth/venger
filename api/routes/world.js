const express = require('express')
const router = express.Router()
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)

const prompt = `
imagine a fantasy world
- something with mature themes and nuanced characters
- it should have a name, a time period or era, a struggle between good and evil
- it should have at least one very important character worth mentioning. examples: a ruler, a rogue wizard, a rogue general, or an ancient dragon
- describe the world in no more than two or three paragraphs
`

router.get('/', async function(req, res, next) {
  const response = await openai.createChatCompletion({
    messages: [
      {role: 'system', content: 'you are a game master that follows dungeons and dragons d20 srd 5e rules'},
      {role: 'user', content: prompt}
    ], 
    model: 'gpt-3.5-turbo',
    temperature: 0.75
  })
  // const usage = response.data.usage
  // console.log('response', response.data.choices[0].message)
  const description = response.data.choices[0].message.content
	res.status(200).send({ description })
})

module.exports = router
