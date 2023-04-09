"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("../utils");
const ai_1 = require("../ai");
const start_prompt = (0, utils_1.template) `
OUR GAME IS TAKING PLACE IN THIS WORLD:
${'world'}

CURRENT PLAYER STATUS:
${'character'}

- create an easy encounter set in the world that tests my character's best attributes
- describe the first scene of the encounter to me in less than four sentances
- end your response with a no more than 3 options for how my character can proceed
- each option must make sense given my character's strengths and weaknesses
- each option must make sense given the current situation
- if the character has no spells, do not offer options involving spells
- each option should be less than 4 words
- ${'userPrompt'}

rewrite your response in this JSON format:
{
  "description": "your description of the scene",
  "options": []
}
`;
const router = express_1.default.Router();
router.post('/', async function (req, res, next) {
    const userPrompt = req.body['userPrompt'];
    if (await (0, ai_1.moderated)(userPrompt))
        throw `MODERATED: ${userPrompt}`;
    const world = req.body['world'];
    const character = req.body['character'];
    const reponse = await (0, ai_1.one_shot)(start_prompt({ world, character, userPrompt }), .75);
    console.log('/api/start prompt', reponse.data.usage);
    const json = (0, ai_1.top_choice)(reponse);
    res.status(200).send({ ...JSON.parse(json) });
});
exports.default = router;
