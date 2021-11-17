# pug-element-loader

[![npm version](https://badge.fury.io/js/pug-element-loader.svg)](https://badge.fury.io/js/pug-element-loader)

A loader that converts pug mixin blocks into custom elements for web components.

### ⚠ Caution ⚠

This is an experimental implementation and should not be used in a production environment.  
I accept no liability whatsoever.

### Usage

```shell
$ npm i pug-element-loader
```

It's not packaged yet, so if you want to try it out, clone this repository and use it.

For use with webpack.

The following is an example of `webpack.config.js`.

```javascript
module: {
    rules: [
        {
            test: /\.ce\.pug$/,
            use: ["pug-element-loader"],
        },
    ]
}
```

The `***.ce.pug` file will then export a class object that inherits from HTMLElement, so all you have to do is define it as a custom element.

```pug
mixin sample-element(align)
    div.el-heading-lv2(style = `text-align: ${align};`)
        h2
            // block is the slot element.
            block
        p This is Sample.
```

All you have to do is register it as a custom element and write it in your HTML.

```javascript
// The class name is exported with the mixin converted to Pascal case.
import SampleElement from './sample-element.ce.pug';

// ex. <sample-element align="center">Sample Text</sample-element>
customElements.define('sample-element', SampleElement);
```
### Support list

I lack verification on everything, so if you find a bug, please report it to me and I will be very happy.

|Pug Docks|Support|
|---|---|
|[Attributes](https://pugjs.org/language/attributes.html)|Support *1|
|[Case](https://pugjs.org/language/case.html)|Support|
|[Code](https://pugjs.org/language/code.html)|To be supported|
|[Comments](https://pugjs.org/language/comments.html)|Support|
|[Conditionals](https://pugjs.org/language/conditionals.html)|Support|
|[Doctype](https://pugjs.org/language/doctype.html)|Not Support|
|[Filters](https://pugjs.org/language/filters.html)|Plans for support|
|[Includes](https://pugjs.org/language/includes.html)|Pre Support *2|
|[Template Inheritance](https://pugjs.org/language/inheritance.html)|Plans for support|
|[Interpolation](https://pugjs.org/language/interpolation.html)|Pre Support *3|
|[Iteration](https://pugjs.org/language/iteration.html)|To be supported|
|[Mixins](https://pugjs.org/language/mixins.html)|Plans for support *4|
|[Plain Text](https://pugjs.org/language/plain-text.html)|Support *5|
|[Tags](https://pugjs.org/language/tags.html)|Support *6|

*1. Support for "Unescaped Attributes" and "Quoted Attributes" excluded.  
*2 A simple pug file can probably be read, but is not fully validated.  
*3 Only "String Interpolation, Escaped" is supported, but other features will be supported.  
*4 Support will be promoted for use as multiple blocks, i.e. named slot elements.  
*5 Support for "Literal HTML" excluded.  
*6 "Self-Closing Tags", i.e. void elements, cannot be controlled by JavaScript, so it seems impossible to implement.

### To do

- From those that are "To be supported".
- Verification of the functions you say you support ... What is support? 🤔