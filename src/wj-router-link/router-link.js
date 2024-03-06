import { default as WJElement } from "../wj-element/wj-element.js";
import { bindRouterLinks } from "../wj-router/plugins/slick-router/middlewares/router-links.js";

import styles from "./scss/styles.scss?inline";

export class RouterLink extends WJElement {
    constructor() {
        super();

        bindRouterLinks(this, { selector: false });
    }

    className = "RouterLink";

    static get cssStyleSheet() {
        return styles;
    }

    static get observedAttributes() {
        return [];
    }

    setupAttributes() {
        this.isShadowRoot = "open";
        this.setAttribute("active-class", "active");
    }

    draw(context, store, params) {
        let fragment = document.createDocumentFragment();

        let element = document.createElement("slot");

        fragment.appendChild(element);

        return fragment;
    }
}

customElements.get("wj-router-link") || window.customElements.define("wj-router-link", RouterLink);