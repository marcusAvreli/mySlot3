import { default as WJElement, event } from "../wj-element/wj-element.js";
import { bool } from "../utils/wj-utils.js";
import { elementPrefix } from '../shared/index.js';
import * as styles from "./scss/styles.scss";
/**
 * @injectHTML
 */
export class Button extends WJElement {
    constructor() {
        super();
    }
	static get is() {
		return `${elementPrefix}-button`;
	}
	static set cssStyleSheet(inStyle) {		
		this.styles = inStyle;
	}
    static get cssStyleSheet() {		
        return this.styles;
    }
    set active(value) {
        this.setAttribute("active", "");
    }

    get active() {
        return this.hasAttribute("active");
    }

    set disabled(value) {
        this.setAttribute("disabled", "");
    }

    get disabled() {
        return this.hasAttribute("disabled");
    }

    set fill(value) {
        this.setAttribute("fill", value);
    }

    get fill() {
        return this.getAttribute("fill") || "solid";
    }

    set outline(value) {
        this.setAttribute("outline", "");
    }

    get outline() {
        return this.hasAttribute("outline");
    }

    set round(value) {
        this.setAttribute("round", "");
    }

    get round() {
        return this.hasAttribute("round");
    }

    set stopPropagation(value) {
        this.setAttribute("stop-propagation", bool(value));
    }

    get stopPropagation() {
        return bool(this.getAttribute("stop-propagation"));
    }

    static get className(){
		return "Button";
	}

    

    static get observedAttributes() {
        return [];
    }

    setupAttributes() {
        this.isShadowRoot = "open";
    }

    draw(context, store, params) {
        let fragment = document.createDocumentFragment();

        if(this.disabled)
            this.classList.add("wj-button-disabled");

        if(this.variant)
            this.classList.add("wj-button-" + this.variant);

        if(this.round)
            this.classList.add("wj-button-round")

        if(this.outline)
            this.classList.add("wj-outline");

        if(this.fill)
            this.classList.add("wj-button-" + this.fill);

        if(this.size)
            this.classList.add("wj-button-" + this.size);

        if(this.hasAttribute("color"))
            this.classList.add("wj-color-" + this.color, "wj-color");
        else
            this.classList.add("wj-color-default", "wj-color");

        if(this.hasAttribute("caret") || this.hasAttribute("only-caret")) {
            let i = document.createElement("wj-icon");
            i.style.setProperty("--wj-icon-size", "14px");
            i.setAttribute("slot", "caret");
            i.setAttribute("name", "chevron-down");

            this.appendChild(i);
        }

        if(this.active) {
            this.classList.add("wj-active");
            let i = document.createElement("wj-icon");
            i.setAttribute("name", "check");

            this.appendChild(i);
        }

        if(this.disabled)
            this.classList.add("wj-disabled");

        let element = document.createElement(this.hasAttribute('href') ? 'a': 'button');
        element.classList.add("button-native");
        element.setAttribute("part", "native");

        let  span = document.createElement("span");
        span.classList.add("button-inner");

        let slot = document.createElement("slot");
        slot.setAttribute("name", "icon-only");
        span.appendChild(slot);

        slot = document.createElement("slot");
        slot.setAttribute("name", "start");
        span.appendChild(slot);

        slot = document.createElement("slot");
        span.appendChild(slot);

        slot = document.createElement("slot");
        slot.setAttribute("name", "end");
        span.appendChild(slot);

        slot = document.createElement("slot");
        slot.setAttribute("name", "caret");
        span.appendChild(slot);

        element.appendChild(span);
        fragment.appendChild(element);

        return fragment;
    }

    afterDraw() {
        event.addListener(this, "click", "wj:button-click", null, { stopPropagation: this.stopPropagation });
        event.addListener(this, "click", null, this.eventDialogOpen);
    }

    beforeDisconnect() {
        this.removeEventListener("click", this.eventDialogOpen);
    }

    eventDialogOpen (e){
        document.dispatchEvent(
            new CustomEvent(this.dialog, {
                bubbles: true
            }
        ));
    }
}

customElements.get(Button.is) || window.customElements.define(Button.is, Button);