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
const path = require('path');

module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.ce.pug$/,
                use: [
                    path.resolve(__dirname, "src/custom-loader.js"),
                ],
            },
            // ...
        ]
    }
    // ...
}
```

The `***.ce.pug` file will then export a class object that inherits from HTMLElement, so all you have to do is define it
as a custom element.

```pug
mixin sample-element(align, pattern, dataSample)
    //- It won't work without "this".
    div.el-heading-lv2(style = `text-align: ${this.align};`)
        h2
            span
                block
        p This is Sample.
```

```javascript
import SampleElement from './sample-element.ce.pug';

customElements.define('sample-element', SampleElement);
```

### To do

- Too many to write.