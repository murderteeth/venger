"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ping_1 = __importDefault(require("./agents/ping"));
const hail_1 = __importDefault(require("./agents/hail"));
const world_1 = __importDefault(require("./agents/world"));
const character_1 = __importDefault(require("./agents/character"));
const start_1 = __importDefault(require("./agents/start"));
const action_1 = __importDefault(require("./agents/action"));
const sync_1 = __importDefault(require("./agents/sync"));
const port = (process.env.PORT || 9000);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/ping', ping_1.default);
app.use('/api/hail', hail_1.default);
app.use('/api/world', world_1.default);
app.use('/api/character', character_1.default);
app.use('/api/start', start_1.default);
app.use('/api/action', action_1.default);
app.use('/api/sync', sync_1.default);
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
});
exports.default = app;
