const path = require('path');
const lex = require('pug-lexer');
const stripComments = require('pug-strip-comments');
const parse = require('pug-parser');
const load = require('pug-load');
const link = require('pug-linker');

const toCamelCase = (text) => text.replace(/-\w/g, clearAndUpper);
const toPascalCase = (text) => text.replace(/(^\w|-\w)/g, clearAndUpper);
const clearAndUpper = (text) => text.replace(/-/, "").toUpperCase();

module.exports = function (source) {

    // source to ast
    const filename = path.basename(this.resourcePath);
    const tokens = lex(source, {filename});
    const ast = (() => {
        const stripCommentTokens = stripComments(tokens, {filename});
        const ast = parse(stripCommentTokens, {filename});
        const includeExternalFile = load(ast, {
            lex,
            parse,
            resolve: (filename, _source, _options) =>
                path.join(path.dirname(this.resourcePath), filename)
        });
        return link(includeExternalFile);
    })();

    return ast.nodes.reduce((acc, current) => {
        const {name, source} = createClass(current);
        return acc + `${name}: ${source},`;
    }, "module.exports = {") + "}";
};

const createClass = (ast) => {
    const args = (ast.args || '')
        .split(',')
        .map(key => key.trim())
        .filter(Boolean)
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


        if (a.type === "BlockComment") {
            s += `const text = ${JSON.stringify(a.block.nodes)}
              .map(t => t.val)
              .join('');`;
            s += `e = document.createComment(text);`;
            s += `parent.appendChild(e);`;
        } else if (a.type === "Code" && !a.buffer) {
            s += `e = document.createElement('script');`;
            s += `e.textContent = "${a.val}";`;
            s += `parent.appendChild(e);`;
        } else if (a.type === "Code" && a.buffer) {
            s += `const tmp = ${a.val};`;
            s += `e = document.createTextNode(tmp);`;
            s += `parent.appendChild(e);`;
        } else if (a.type === "Comment") {
            s += `e = document.createComment(${JSON.stringify(a.val)});`;
            s += `parent.appendChild(e);`;
        } else if (a.type === "Conditional") {
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
                        return `(() => {
                          const classItem = ((items) => {
                            if (Array.isArray(items)) {
                              return items.map(item => item.trim())
                                .filter(Boolean);
                            }
                            return items.split(' ')
                              .map(item => item.trim())
                              .filter(Boolean);
                            })(${attr.val});
                          e.classList.add(...classItem);
                        })();`
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
            a.attributeBlocks.map(attr => {
                s += `const attrs = ${attr.val};
                Object.keys(attrs).forEach(key => {
                  e.setAttribute(key, attrs[key]);
                });`;
            })
        } else if (a.type === "Text") {
            s += `t = document.createElement('template');`;
            s += `t.innerHTML = ${JSON.stringify(a.val)};`;
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