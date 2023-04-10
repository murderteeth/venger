"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("../utils");
const ai_1 = require("../ai");
const world_prompt = (0, utils_1.template) `
imagine a fantasy world
- it should have a name, a time period or era, a struggle between good and evil
- it should have at least one very important character worth mentioning. examples: a ruler, a rogue wizard, a rogue general, or an ancient dragon
- ${'userPrompt'}

write your response in this JSON format:
{
  "description": "describe the world in less than four paragraphs",
  "summary": "summarize the world"
}
`;
const router = express_1.default.Router();
router.post('/', async function (req, res, next) {
    const userPrompt = req.body['userPrompt'];
    if (await (0, ai_1.moderated)(userPrompt))
        throw `MODERATED: ${userPrompt}`;
    const response = await (0, ai_1.one_shot)(world_prompt({ userPrompt }), .7);
    console.log('/world prompt', response.data.usage);
    const world = (0, ai_1.top_choice)(response);
    res.status(200).send({ ...JSON.parse(world) });
});
exports.default = router;
