import HeadingLv2 from './test.ce.pug';

customElements.define('heading-lv2', HeadingLv2);

const sample = {
    "type": "Tag",
    "name": "div",
    "selfClosing": false,
    "block": {
        "type": "Block",
        "nodes": [
            {
                "type": "Tag",
                "name": "h2",
                "selfClosing": false,
                "block": {
                    "type": "Block",
                    "nodes": [
                        {
                            "type": "Tag",
                            "name": "span",
                            "selfClosing": false,
                            "block": {
                                "type": "Block",
                                "nodes": [
                                    {
                                        "type": "Text",
                                        "val": "aaa",
                                        "line": 4,
                                        "column": 18
                                    }
                                ],
                                "line": 4
                            },
                            "attrs": [],
                            "attributeBlocks": [],
                            "isInline": true,
                            "line": 4,
                            "column": 13
                        },
                        {
                            "type": "Tag",
                            "name": "span",
                            "selfClosing": false,
                            "block": {
                                "type": "Block",
                                "nodes": [
                                    {
                                        "type": "MixinBlock",
                                        "line": 6,
                                        "column": 17
                                    }
                                ],
                                "line": 5
                            },
                            "attrs": [],
                            "attributeBlocks": [],
                            "isInline": true,
                            "line": 5,
                            "column": 13
                        }
                    ],
                    "line": 3
                },
                "attrs": [],
                "attributeBlocks": [],
                "isInline": false,
                "line": 3,
                "column": 9
            }
        ],
        "line": 2
    },
    "attrs": [
        {
            "name": "class",
            "val": "'el-heading-lv2'",
            "line": 2,
            "column": 8,
            "mustEscape": false
        },
        {
            "name": "style",
            "val": "`text-align: ${align};`",
            "line": 2,
            "column": 24,
            "mustEscape": true
        }
    ],
    "attributeBlocks": [],
    "isInline": false,
    "line": 2,
    "column": 5
};

const build = (pointer, ast) => ast.reduce((acc, current, _index) => {
    const tagOrText = (() => {
        if (current.type === "Tag") {
            return document.createElement(current.name);
        } else if (current.type === "MixinBlock") {
            return document.createElement("slot");
        } else {
            return document.createTextNode(current.val);
        }
    })();
    // pointer.appendChild(tagOrText);
    if (current && current.block && current.block.nodes) {
        return build(tagOrText, current.block.nodes);
    }
    return tagOrText;
}, pointer)

const result = build(document.body, sample.block.nodes);

// console.log(result);