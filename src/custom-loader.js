const lex = require('pug-lexer');
const stripComments = require('pug-strip-comments');
const parse = require('pug-parser');
const path = require('path');

module.exports = function (source) {

    const toCamelCase = (text) => text.replace(/-\w/g, clearAndUpper);
    const toPascalCase = (text) => text.replace(/(^\w|-\w)/g, clearAndUpper);
    const clearAndUpper = (text) => text.replace(/-/, "").toUpperCase();

    const filename = path.basename(this.resourcePath);
    const tokens = lex(source, {filename});
    const ast = parse(stripComments(tokens, {filename}), {filename}).nodes[0];

    const args = ast.args
        .split(',')
        .map(key => key.trim());

    // @todo don't use eval
    const js = `class ${toPascalCase(ast.name)} extends HTMLElement{
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        ${args.map(key =>
        `this.${key} = this.getAttribute('${key}')`)
        .join(';\n') + ';'}

        const build = (pointer, ast) => ast.reduce((acc, current, _index) => {
            const tagOrText = (() => {
                if (current.type === "Tag") {
                    const tag = document.createElement(current.name);
                    current.attrs.forEach(({name, val}) => {
                        tag.setAttribute(name, eval(val));
                    });
                    return tag;
                } else if (current.type === "MixinBlock") {
                    return document.createElement("slot");
                } else if (current.type === "Code") {
                    return null;
                } else {
                    return document.createTextNode(current.val);
                }
            })();
            if(tagOrText){
                pointer.appendChild(tagOrText);
            }
            if (current && current.block && current.block.nodes) {
                return build(tagOrText, current.block.nodes);
            }
            return tagOrText;
        }, pointer)

        const result = build(shadowRoot, ${JSON.stringify(ast.block.nodes)});
    }
    ${args.map(key =>
        `${key};`)
        .join('\n')}
    ${args.map(key =>
        // getter    
        `get ${key}() { return this.${key}; }`)
        .join('\n')}
}`;

    return `module.exports = ${js}`;
};