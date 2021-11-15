import {
    FirstViewSource,
    MultilineAttributes,
    QuotedAttributes,
    AttributeInterpolation,
    BooleanAttributes,
    StyleAttributes,
    ClassAttributes,
    ClassLiteral,
    IdLiteral,
    AndAttributes
} from './languageReference/attributes.ce.pug';

customElements.define('first-view-source', FirstViewSource);
customElements.define('multiline-attributes', MultilineAttributes);
customElements.define('quoted-attributes', QuotedAttributes);
customElements.define('attribute-interpolation', AttributeInterpolation);
customElements.define('boolean-attributes', BooleanAttributes);
customElements.define('style-attributes', StyleAttributes);
customElements.define('class-attributes', ClassAttributes);
customElements.define('class-literal', ClassLiteral);
customElements.define('id-literal', IdLiteral);
customElements.define('and-attributes', AndAttributes);
