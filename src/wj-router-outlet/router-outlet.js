import { default as WJElement, WjElementUtils } from "../wj-element/wj-element.js";
import { AnimatedOutlet } from '../wj-router/plugins/slick-router/components/animated-outlet.js';

customElements.get("wj-router-outlet") || window.customElements.define("wj-router-outlet", AnimatedOutlet);