import { default as WJElement } from "/templates/net/assets/js/components/wj-element.js?v=@@version@@";
import { default as Table } from "../../wj-table.js?v=@@version@@";

const template = document.createElement("template");
template.innerHTML = `<style>
    @import "/templates/net/assets/plugins/bootstrap/css/bootstrap.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/fontawesome.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/light.min.css";
    
    :host {
        display: flex;
        align-items: center;
        margin: 1rem 0 1rem auto;
    }
    
    .search {
        position: relative;
    }
       
    input {
        /*border: 0 none !important;*/
        min-height: 28px !important;
        padding: 2px 5px;
        max-height: 24px !important;
    }
    
    .btn-search {
        position: absolute;
        right: 0;
        top: 0;
        min-height: 28px !important;
    }
</style>

<div class="search">
    <input type="text" placeholder="Vyhľadávanie" class="form-control input-xs" />
    <button class="btn btn-link btn-search"><i class="fa-light fa-search"></i></button>
</div>`;

export default class FilterSimple extends WJElement {
    constructor() {
        super(template);
    }

    draw(context, store, params) {
        // click na button
        this.context.querySelector("button").addEventListener("click", this.executionFilter);

        // stalecnei klavesy enter
        this.context.querySelector("input").addEventListener("keyup", (e) => {
            if(e.key.toUpperCase() == "ENTER"){
                this.executionFilter();
            }
        });
    }

    executionFilter = () => {
        let table = WjTable.getInstance(this.tableId).table;

        table.setFilter("value", "like", this.context.querySelector("input").value);
    }
}

let __esModule = "true";
export {__esModule};

customElements.get("wj-table-filter-simple") || customElements.define("wj-table-filter-simple", FilterSimple);
