import { default as WJElement, WjElementUtils } from "../wj-element/wj-element.js";
import { getName, getUrl, getSvgContent, iconContent } from "./service/service.js";
import { elementPrefix } from '../shared/index.js';


export class Icon extends WJElement {
    constructor() {
        super();
    }
	static get is() {
		return `${elementPrefix}-icon`;
	}
static get className(){
    return "Icon";
}

    static set cssStyleSheet(inStyle) {		
		this.styles = inStyle;
	}
    static get cssStyleSheet() {
        return this.styles;
    }

    static get observedAttributes() {
        return ["name"];
    }

    setupAttributes() {
        this.isShadowRoot = "open";
    }

    draw(context, store, params) {
        let fragment = document.createDocumentFragment();

        this.classList.add("lazy-loaded-image", "lazy");

        this.element = document.createElement("div");
        this.element.classList.add("icon-inner");

        this.url = getUrl(this);

        this.classList.add("wj-size");
        if(this.color)
            this.classList.add("wj-color-" + this.color, "wj-color");

        if(this.size)
            this.classList.add("wj-size-" + this.size);

        fragment.appendChild(this.element);

        return fragment;
    }

    afterDraw() {
        let lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    getSvgContent(this.url).then((svgContent) => {
                        this.element.innerHTML = iconContent.get(this.url);
                    });
                    // entry.target.name = this.src;
                    this.classList.remove("lazy");
                    lazyImageObserver.unobserve(entry.target);
                }
            });
        });

        lazyImageObserver.observe(this.element);
    }
	unregister(){
		console.log("icon","unregister");
	}
}

customElements.get(Icon.is) || window.customElements.define(Icon.is, Icon);