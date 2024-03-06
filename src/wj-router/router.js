import { default as WJElement, WjElementUtils } from "../wj-element/wj-element.js";
import { interceptLinks, Router } from './plugins/slick-router/slick-router.js';
import { paramValue, wc } from './plugins/slick-router/middlewares/wc.js';
import { routerLinks } from './plugins/slick-router/middlewares/router-links.js';
import { events } from './plugins/slick-router/middlewares/events.js';

export class Routerx extends WJElement {
    constructor() {
        super();
    }

    className = "Routerx";

    static get observedAttributes() {
        return [];
    }

    setupAttributes() {
        this.isShadowRoot = "open";
    }

    afterDraw() {
        const htmlString = this.outerHTML;

        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(htmlString, 'text/html');
        const rootElement = htmlDocument.querySelector("wj-router");

        const routes = this.parseElement(rootElement).root;
        this.router = new Router({
            outlet: this.outlet || "wj-router-outlet",
            log: false,
            logError: false,
            root: "/",
            pushState: true,
        });

        this.router.map(routes);
        this.router.use(this.setBreadcrumb);
        this.router.use(wc);
        this.router.use(routerLinks);
        this.router.use(events);
        this.router.use(this.resetScrollPosition);
        this.router.listen();

        interceptLinks(this.router);
    }

    parseElement(element) {
        const obj = {};

        const attributes = element.attributes;
        for (let i = 0; i < attributes.length; i++) {
            const attributeName = attributes[i].name;
            const attributeValue = attributes[i].value;

            if (attributeName === 'component' && attributeValue.indexOf(".js") > -1) {
                obj.component = () => import(attributeValue); // lazy loading component
            } else {
                if (attributeName !== 'shadow') {
                    obj[attributeName] = attributeValue;
                }
            }
        }

        const children = [];
        const childElements = Array.from(element.children);

        childElements.forEach(childElement => {
            children.push(this.parseElement(childElement));
        });

        if (children.length > 0 && element.tagName === "WJ-ROUTE") {
            obj.children = children;
        } else {
            obj.root = children;
        }

        return obj;
    }

    setBreadcrumb = (transition) => {
        let breadcrumb = [
            ...transition.routes
                .filter((obj) => "breadcrumb" in obj.options)
                .map((b, i) => {
                    return {
                        name: b.options.breadcrumbPath || b.name,
                        text: b.options.breadcrumb instanceof Function ? b.options.breadcrumb?.(transition) : b.options.breadcrumb,
                        params: {...b.params, ...transition.params},
                        path: this.router.generate(b.name, {...b.params, ...transition.params}),
                    }
                }),
        ];

        transition.breadcrumbs = breadcrumb;
    }

    resetScrollPosition = (transition) => {
        window.scrollTo(0, 0);
    }
}

customElements.get("wj-router") || window.customElements.define("wj-router", Routerx);