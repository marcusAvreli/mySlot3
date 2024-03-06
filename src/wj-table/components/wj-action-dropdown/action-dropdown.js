import { default as Dropdown } from "/templates/net/assets/js/components/wj-dropdown/wj-dropdown.js";

const template = document.createElement('template');
template.innerHTML = `<style>
    @import "/templates/net/assets/plugins/bootstrap/css/bootstrap.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/fontawesome.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/light.min.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic/var.css?v=@@version@@";
    
    :host {
        margin: 0 auto!important;
    }
</style>`;

export default class ActionDropdown extends Dropdown {
    constructor() {
        super(template);
    }

    getButton() {
        let button = document.createElement("div");
        button.classList.add("btn-icon-link");
        button.innerHTML = '<i class="fa-light fa-ellipsis-vertical"></i>';
        return button;
    }
}

let __esModule = "true";
export { __esModule };

customElements.get("wj-table-action-dropdown") || customElements.define("wj-table-action-dropdown", ActionDropdown);
