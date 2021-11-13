const lex = require('pug-lexer');
const stripComments = require('pug-strip-comments');
const parse = require('pug-parser');
const path = require('path');

const toCamelCase = (text) => text.replace(/-\w/g, clearAndUpper);
const toPascalCase = (text) => text.replace(/(^\w|-\w)/g, clearAndUpper);
const clearAndUpper = (text) => text.replace(/-/, "").toUpperCase();

module.exports = function (source) {

    const filename = path.basename(this.resourcePath);
    const tokens = lex(source, {filename});
    let origin = parse(stripComments(tokens, {filename}), {filename});
    const ast = origin.nodes[0];

    const result = origin.nodes.reduce((acc, current) => {
        const {name, source} = createClass(current);
        return acc + `${name}: ${source},`;
    }, "module.exports = {") + "}";

    console.log(result);
    console.log(JSON.stringify({HeadingLv2: result}));
    return result;
};

const createClass = (ast) => {
    const args = (ast.args || '')
        .split(',')
        .filter(Boolean)
        .map(key => key.trim())
        .map(key => {
            const list = key.split("=");
            return ({name: list[0], defaultValue: (list[1] || null)});
        });

    if (args.find(key => key.name.startsWith('...'))) {
        throw new Error('Rest Arguments is Not Support');
    }

    const build = (parent, a) => {
        let s = "((parent) => {";
        s += `let e = parent;`;
        s += `let t;`;

        if (a.type === "Code" && a.buffer) {
            s += `const tmp = ${a.val};`;
            s += `e = document.createTextNode(tmp);`;
            s += `parent.appendChild(e);`;
        } else if (a.type === "Comment") {
            s += `e = document.createComment(${JSON.stringify(a.val)});`;
            s += `parent.appendChild(e);`;
        }
        if (a.type === "Conditional") {
            s += `if(${a.test}) {`
            s += build('parent', a.consequent);
            s += `} else {`
            s += build('parent', a.alternate);
            s += `}`;
        } else if (a.type === "MixinBlock") {
            s += `e = document.createElement("slot");`;
            s += `parent.appendChild(e);`;
        } else if (a.type === "Tag") {
            s += `e = document.createElement("${a.name}");`;
            s += `parent.appendChild(e);`;
            // think about use pug-attrs
            s += a.attrs
                .map(attr => {
                    if (attr.name === 'class') {
                        return `const classItem = ${attr.val};
                        if (Array.isArray(classItem)) {
                          e.classList.add(...classItem);
                        } else {
                          e.classList.add(classItem);                          
                        }`
                    }
                    if (attr.name === 'style') {
                        return `const styles = ${attr.val};
                          if (typeof styles === 'string') {
                            e.setAttribute('${attr.name}', ${attr.val});
                          } else {
                            Object.keys(styles)
                            .forEach(key => {
                              e.style[key] = styles[key];
                            });
                          }`
                    }
                    return `if (typeof ${attr.val} === 'boolean' && ${attr.val}) {
                        e.setAttribute('${attr.name}', '${attr.name}');
                      } else if (typeof ${attr.val} !== 'boolean') {
                        e.setAttribute('${attr.name}', ${attr.val});
                      }`;
                })
                .join('');
        } else if (a.type === "Text") {
            s += `t = document.createElement('template');`;
            s += `t.innerHTML = ${JSON.stringify(a.val)};`;
            s += `e = document.createTextNode(${JSON.stringify(a.val)});`;
            s += `parent.appendChild(t.content);`;
        }

        if ((a.block && a.block.nodes) || a.nodes) {
            (a.nodes || a.block.nodes || []).forEach(current => {
                s += build('e', current);
            });
        }

        s += `})(${parent});`;

        return s;
    };

    let innerNodeBuildScript = build('shadowRoot', ast.block);

    const js = `class ${toPascalCase(ast.name)} extends HTMLElement{
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        ${args.map(key =>
        `const ${key.name} = this.getAttribute('${key.name}') || ${key.defaultValue};
        this.${key.name} = ${key.name};`)
        .join('\n')}

        ${innerNodeBuildScript}
    }
    ${args.map(key =>
        `${key.name};`)
        .join('\n')}
    ${args.map(key =>
        // getter    
        `get ${key.name}() { return this.${key.name}; }`)
        .join('\n')}
}`;
    return {name: toPascalCase(ast.name), source: js};
}