"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to_object = exports.top_choice = exports.multi_shot = exports.one_shot = void 0;
const openai_1 = require("openai");
const utils_1 = require("./utils");
const configuration = new openai_1.Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
const system_prompt = 'you are a game master that follows dungeons and dragons d20 srd 5e rules';
async function one_shot(prompt, temperature = 0.4) {
    if (process.env.NODE_ENV === 'development') {
        console.log();
        console.log('prompt/ ---------------');
        console.log(`system: ${system_prompt}`);
        console.log(prompt);
        console.log('prompt/ ---------------');
        console.log();
    }
    return await openai.createChatCompletion({
        messages: [
            { role: 'system', content: system_prompt },
            { role: 'user', content: prompt }
        ],
        model: 'gpt-3.5-turbo',
        temperature
    });
}
exports.one_shot = one_shot;
async function multi_shot(messages, temperature = 0.4) {
    if (process.env.NODE_ENV === 'development') {
        console.log();
        console.log('prompt/ ---------------');
        messages.forEach(message => {
            console.log(`${message.role}: ${message.content}`);
        });
        console.log('prompt/ ---------------');
        console.log();
    }
    return await openai.createChatCompletion({
        messages,
        model: 'gpt-3.5-turbo',
        temperature
    });
}
exports.multi_shot = multi_shot;
function top_choice(response) {
    var _a;
    if (!response.data.choices.length)
        throw '!choices';
    const content = (_a = response.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
    if (!content)
        throw '!content';
    return content;
}
exports.top_choice = top_choice;
const rewrite_prompt = (0, utils_1.template) `
rewrite this text:
${'source'}

${'output_prompt'}
`;
async function to_object(source, output_prompt) {
    const rewriteResponse = await one_shot(rewrite_prompt({ source, output_prompt }), .1);
    console.log('/api.. rewrite prompt', rewriteResponse.data.usage);
    const rewrite = top_choice(rewriteResponse);
    return JSON.parse(rewrite);
}
exports.to_object = to_object;
