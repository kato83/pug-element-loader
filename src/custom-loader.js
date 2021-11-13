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

    const build = (parent, a) => {
        let s = "((parent) => {";
        s += `let e;`;
        a.forEach(current => {
            // HTML Node
            if (current.type === "Tag") {
                s += `e = document.createElement("${current.name}");`
                s += `parent.appendChild(e);`;
                // think about use pug-attrs
                s += current.attrs
                    .map(attr => `e.setAttribute('${attr.name}', ${attr.val});`)
                    .join('');
            }
            // Text Node
            else if (current.type === "Text") {
                s += `e = document.createTextNode(${JSON.stringify(current.val)});`;
                s += `parent.appendChild(e);`;
            }
            // Slot Node
            else if (current.type === "MixinBlock") {
                s += `e = document.createElement("slot");`
                s += `parent.appendChild(e);`;
            }
            // HTML Comment Node
            else if (current.type === "Comment") {
                s += `e = document.createComment(${JSON.stringify(current.val)});`;
                s += `parent.appendChild(e);`;
            }
            if (current.block && current.block.nodes && current.block.nodes.length) {
                s += build('e', current.block.nodes);
            }
        })
        s += `})(${parent});`;
        return s;
    };

    console.log(JSON.stringify(ast.block.nodes, null, ' '));

    let innerNodeBuildScript = build('shadowRoot', ast.block.nodes);
    console.log(innerNodeBuildScript);

    const js = `class ${toPascalCase(ast.name)} extends HTMLElement{
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        ${args.map(key =>
        `const ${key} = this.getAttribute('${key}');
        this.${key} = ${key};`)
        .join('\n')}

        ${innerNodeBuildScript}
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