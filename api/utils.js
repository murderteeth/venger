"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = void 0;
function template(strings, ...keys) {
    return (placeholders) => {
        let result = strings[0];
        keys.forEach((key, i) => {
            result += String(placeholders[key]) + strings[i + 1];
        });
        return result;
    };
}
exports.template = template;
