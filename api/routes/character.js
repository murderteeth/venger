"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("../utils");
const ai_1 = require("../ai");
const character_prompt = (0, utils_1.template) `
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
- ${'userPrompt'}

the character will be playing in this world:
${'world'}

rewrite your response in this JSON format:
{
  "name": "string",
  "age": "number",
  "gender": "string",
  "alignment": "string",
  "character_class": "string",
  "race": "string",
  "attributes": {
    "strength": "number",
    "dexterity": "number",
    "constitution": "number",
    "intelligence": "number",
    "wisdom": "number",
    "charisma": "number"
  },
  "skills": [
    {"name": "string", "modifier": "number"}
  ],
  "max_hitpoints": "number",
  "hitpoints": "number",
  "experience_points": "number",
  "inventory": [
    {"item": "string", "count": "number"},
    {"item": "gold", "count": "number"}
  ],
  "backstory": "string",
  "summary": "string"
}
`;
const router = express_1.default.Router();
router.post('/', async function (req, res, next) {
    const userPrompt = req.body['userPrompt'];
    const world = req.body['world'];
    const characterResponse = await (0, ai_1.one_shot)(character_prompt({ world, userPrompt }), .8);
    console.log('/character prompt', characterResponse.data.usage);
    const character = (0, ai_1.top_choice)(characterResponse);
    res.status(200).send({ ...JSON.parse(character) });
});
exports.default = router;
