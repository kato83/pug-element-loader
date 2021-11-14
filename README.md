# pug-element-loader

A loader that converts pug mixin blocks into custom elements for web components.

### ⚠ Caution ⚠

This is an experimental implementation and should not be used in a production environment.  
I accept no liability whatsoever.

### Usage

It's not packaged yet, so if you want to try it out, clone this repository and use it.

For use with webpack.

The following is an example of `webpack.config.js`.

```javascript
module: {
    rules: [
        {
            test: /\.ce.pug$/,
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
import SampleElement from './sample-element.ce.pug';

// ex. <sample-element align="center">Sample Text</sample-element>
customElements.define('sample-element', SampleElement);
```

### To do

- Too many to write.