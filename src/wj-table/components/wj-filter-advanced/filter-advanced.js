
import {  Table } from "../../table.js";
import { elementPrefix } from '../../../shared/index.js';
import "../wj-filter-dropdown/filter-dropdown.js";
import {UniversalService} from '../../../wj-element/service/universal-service.js';
import {store,defaultStoreActions} from '../../../wj-store/store';
const template = document.createElement("template");
template.innerHTML = `<style>
  
    
    :host {
        margin: 1rem 0;
        display: flex;
        align-items: center;
    }
    
    #filter {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: .5rem 0;
    }
    
    .andor {
        font-size: 12px;
        min-height: 18px;
    }
    
    .remove:hover {
        background: white !important;
    }
    
    .hint-text {
        color: rgba(146, 154, 172, 1) !important;
    }
</style>

<div id="filter"></div>
<div id="options"></div>`;

export  class FilterAdvanced extends HTMLElement {
    constructor() {
        super();
console.log("filter_advanced");
        this.service = new UniversalService({
            store: store,
        });

        this.attachShadow({mode:'open'});
    }
static get is() {
		return `${elementPrefix}-table-filter-advanced`;
	}
    static get observedAttributes(){
        return ["id"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.init();
    }

    connectedCallback(){
    }

    init() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.filterElement = this.shadowRoot.querySelector("#filter");

        this._subscription = store.subscribe("filterObj-" + this.id, (store, data) => {
            this.filterElement.innerHTML = "";
            this.filterArray = store["filterObj-" + this.id].filter;

            if(this.filterArray.length > 0) {
                this.removeAttribute("hidden");
                this.draw(this.filterArray);

            } else {
                this.setAttribute("hidden", "");
            }

            this.executionFilter();
        });
    }

    draw(filter = []) {
        filter.flat().forEach((f) => {
            if(f.option != "WHERE") {
                this.filterElement.appendChild(this.getButtonAndOr(f, f.option));
            }
            this.filterElement.appendChild(this.getButton(f));
        });
    }

    getButtonAndOr(filter, option) {
        let button = document.createElement("button");
        button.classList.add("btn", "btn-xs", "mx-2", "andor");
        button.classList.add(option == "AND" ? "btn-danger-lighter" : "btn-warning-lighter");
        button.type = "button";
        button.innerText = option == "AND" ? "AND" : "OR";
        button.filter = filter;
        button.onclick = (e) => {
            this.changeOptionFilter(button.filter, option == "AND" ? "OR" : "AND");
        }

        return button;
    }

    getButton(f) {
        // DROPDOWN
        let dropdown = document.createElement("wj-table-filter-dropdown");
        dropdown.setAttribute("id", this.id);
        dropdown.setAttribute("position", "bottom-right");
        dropdown.setAttribute("hide-icon", "");
        dropdown.setAttribute("slot-button", "");
        dropdown.setAttribute("input-inside", "");
        dropdown.title = f.text + "jhjhdfjs";
        dropdown.filter = f; // do dropdownu si vlozime object

        let span = document.createElement("span");
        span.setAttribute("slot", "button");
        span.innerText = f.text;

        dropdown.appendChild(span);

        let type = document.createElement("span");
        type.classList.add("hint-text", "ml-1", "mr-1");
        type.innerText = f.type;

        // CHIP
        let button = document.createElement("div");
        button.classList.add("btn-item", "border-0", "trakakak");
        button.type = "button";
        button.innerHTML = f.title;
        button.appendChild(type);
        button.appendChild(dropdown);

        // REMOVE
        let i = document.createElement("button");
        i.classList.add("remove", "btn", "btn-xs");
        i.innerHTML = '<i class="fa-light fa-xmark"></i>';
        i.onclick = (e) => {
            this.filterArray = this.removeFilter(f);

            this.executionFilter();
        }

        button.appendChild(i);

        return button;
    }

    removeFilter(f) {
        let reducer = (acc, next) => {
            if(Array.isArray(next)){
                let ar = next.reduce(reducer,[])
                if(ar.length > 1) {
                    acc.push(next.reduce(reducer,[]))
                } else {
                    ar[0].option = "AND";
                    acc.push(ar[0])
                }
                return acc
            }
            if(next != f){
                acc.push(next)
            }
            return acc;
        }

        this.filterArray = this.filterArray.reduce(reducer,[]);

        if(this.filterArray.length > 0)
            this.filterArray[0].option = "WHERE";


        let field = f.field.split(".")[0];
        WjTable.getInstance(this.id).shadowRoot.querySelector(`[tabulator-field="${field}"]`).classList.remove("filtered");

        return this.filterArray;
    }

    changeOptionFilter(filter, changedOption) {
        this.filterArray = this.filterArray.flat().map(f => {
            if(f == filter)
                f.option = changedOption;

            return f;
        }).reduce((acc, next) => {
            if(next.option == 'OR'){
                acc[acc.length-1] = [
                    ...(Array.isArray(acc[acc.length-1])? acc[acc.length-1] : [acc[acc.length-1]]), next ]
            } else{
                acc.push(next);
            }

            return acc;
        },[]);

        this.executionFilter();
    }

    filterForServer() {
        return this.filterArray.map(a => {
            if(Array.isArray(a))
                return a;
            return [a];
        });
    }

    executionFilter() {
        let table = WjTable.getInstance(this.id).table;

        store.dispatch(defaultStoreActions.addAction("filterObj-" + this.id)({
            "filter": this.filterArray,
            "table": this.id
        }));

        table.setFilter(this.filterForServer());
    }
}

let __esModule = "true";
export {__esModule};

customElements.get(FilterAdvanced.is) || customElements.define(FilterAdvanced.is, FilterAdvanced);
