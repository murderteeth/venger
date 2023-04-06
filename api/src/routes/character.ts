import express from 'express'
import { CreateChatCompletionResponse } from 'openai'
import { template } from '../utils'
import { AxiosResponse } from 'axios'
import { one_shot, to_object, top_choice } from '../ai'

const description_prompt = template`
create me a level 1 dungeons and dragons character using the dungeons and dragons d20 srd 5e rules. 
INCLUDE:
- name
- hitpoints
- age
- gender
- alignment
- class
- race
- use the Standard Array method to set attributes
- assign skill modifiers
- starting inventory
- some gold
- a backstory that fits the world they're playing in

the character will be playing in this world:
${'world'}

special requests: ${'userPrompt'}
`

const summary_prompt = template`
please summarize the provided character into one paragraph with no more than 4 sentances.

EXAMPLE
Character description:
Name: Aria Shadowleaf
Hitpoints: 6
Age: 23
Gender: Female
Alignment: Chaotic Good
Class: Wizard
Race: Half-Elf
Attribute Scores: Strength 8, Dexterity 14, Constitution 12, Intelligence 16, Wisdom 10, Charisma 14
Skill Modifiers: Arcana +5, Deception +4, History +5, Investigation +5, Persuasion +4
Starting Inventory: Spellbook, Quarterstaff, Component pouch, Explorer's pack, 10 gold pieces
Backstory:
Born to a human father and an elven mother, Aria Shadowleaf has always felt like an outsider in both races. Her father was a traveling merchant who had a brief affair with her mother, and Aria never knew him. Her mother, an accomplished wizard, raised her in the ways of magic and taught her the importance of using her powers for good. Aria's thirst for knowledge and adventure led her to leave her mother's side and journey alone across Alderan, seeking to unravel the mysteries of the land and learn as much magic as she could. Along the way, she became known for her ability to outsmart and deceive those who would try to harm her. When she learned of the Oracle's power, she knew she had to seek them out and learn what secrets they held. Aria now travels through the land, using her magic to aid those in need and seeking to uncover the truth behind the factions vying for power in Alderan.

Character summary:
Aria Shadowleaf, a 23-year-old Chaotic Good female Half-Elf Wizard, is driven by her thirst for knowledge and adventure. Raised by her elven mother, an accomplished wizard, she has journeyed across Alderan, using her magic to aid those in need and outsmarting those who threaten her. Skilled in Arcana, Deception, History, Investigation, and Persuasion, Aria is determined to uncover the truth behind the factions vying for power in Alderan and learn the secrets of the Oracle's power.
END OF EXAMPLE

special requests: ${'userPrompt'}

Character description:
${'description'}

Character summary:
`

const to_character_sheet_prompt = `
The output should be formatted as a JSON instance that conforms to the JSON schema below.

As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.

Here is the output schema:
\`\`\`
{
  "properties": 
  {
    "name": {"title": "Name", "type": "string"}, 
    "age": {"title": "Age", "type": "integer"}, 
    "gender": {"title": "Gender", "type": "string"}, 
    "alignment": {"title": "Alignment", "type": "string"}, 
    "character_class": {"title": "Character Class", "type": "string"}, 
    "race": {"title": "Race", "type": "string"}, 
    "attributes": {"title": "Attributes", "type": "object"},
    "skill_modifiers": {"title": "Skill Modifiers", "type": "object"},
    "max_hitpoints": {"title": "Max Hitpoints", "type": "integer"}, 
    "hitpoints": {"title": "Hitpoints", "type": "integer"}, 
    "experience_points": {"title": "Experience Points", "type": "integer"}, 
    "gold": {"title": "Gold", "type": "integer"}, 
    "inventory": {"title": "Inventory", "type": "array", "items": {"type": "string"}}, 
    "backstory": {"title": "Backstory", "type": "string"}, 
    "summary": {"title": "Summary", "type": "string"}
  }, 
  "required": [
    "name", 
    "age", 
    "gender", 
    "alignment", 
    "character_class", 
    "race", 
    "attributes", 
    "skill_modifiers", 
    "max_hitpoints", 
    "hitpoints", 
    "experience_points", 
    "gold", 
    "inventory", 
    "backstory", 
    "summary"
  ]
}
\`\`\`
`

const router = express.Router()

router.post('/', async function(req, res, next) {
  const userPrompt = req.body['userPrompt']
  const world = req.body['world']

  const descriptionResponse = await one_shot(description_prompt({world, userPrompt}), .6)
  console.log('/api/character description prompt', descriptionResponse.data.usage)
  const description = top_choice(descriptionResponse as AxiosResponse<CreateChatCompletionResponse, any>)

  const summaryResponse = await one_shot(summary_prompt({userPrompt, description}))
  console.log('/api/character summary prompt', summaryResponse.data.usage)
  const summary = top_choice(summaryResponse as AxiosResponse<CreateChatCompletionResponse, any>)

  const source = `${description}\n\nsummary: ${summary}`
  const characterSheet = await to_object(source, to_character_sheet_prompt)

  res.status(200).send({...characterSheet})
})

export default router
