import { defaultStoreActions, store } from "../../../wj-store/store.js";
import {  Dropdown } from "../../../wj-dropdown/dropdown.js";
import {  Table } from "../../table.js";
import { elementPrefix } from '../../../shared/index.js';
/*
import '/templates/net/assets/plugins/flatpickr/flatpickr.js';
import '/templates/net/assets/plugins/flatpickr/l10n/sk.js';
import '/templates/net/assets/plugins/flatpickr/plugins/monthSelectPlugin.js';

intranet.loadCSS('/templates/net/assets/plugins/flatpickr/themes/net-basic.css');
*/
const template = document.createElement('template');
template.innerHTML = `<style>
    @import "/templates/net/assets/plugins/bootstrap/css/bootstrap.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic/var.css?v=@@version@@";
    :host {
        padding: 2px 3px;
        border-radius: 3px;
    }
    :host(:hover) {
        background: var(--color-contrast-medium);
        color: #fff;
    }
    .wj-dropdown-menu {
        padding: .5rem;
        min-width: 200px;
        position: absolute !important;
    }
</style>`;

export  class FilterDropdown extends Dropdown {
    constructor() {
        super(template);

        // this.shadowRoot.append(template.content.cloneNode(true));
    }
static get is() {
		return `${elementPrefix}-table-filter-dropdown`;
	}
    get tableId() {
        return this.getAttribute("id");
    }

    getButton() {
        return this.title;
    }

    getDropdown() {
        this.type = this.filter.inputType;
        this.columnOptions = store.getState()["columnOptions-" + this.tableId][this.filter.field.split(".")[0]];

        if (this.dropdown) return this.dropdown;

        let div = super.getDropdown('div');

        div.classList.add("form-group", "mb-0");
        let input = document.createElement("input");
        input.type = "text";
        input.setAttribute("value", this.title);
        input.classList.add("form-control", "input-sm", "dasdsa");
        input.setAttribute("name", "text")

        let range = null;
        if (this.type == "DATE-RANGE" || this.type == "NUMBER-RANGE") {
            range = document.createElement("input");
            range.classList.add("form-control", "input-sm");
            range.setAttribute("type", "number");
            range.setAttribute("placeholder", "Do");
            if (this.type == "DATE-RANGE")
                range.setAttribute("type", "hidden");
        }

        if (this.type == "BOOLEAN" || this.type == "OPTION" || this.type == "MULTISELECT") {
            input = document.createElement("select");
            input.innerHTML = this.columnOptions.map((i) => `<option value="${i.id}">${i.name}</option>`).join(" ");
            input.classList.add("form-control", "input-sm");

            input.addEventListener("change", (e) => {
                this.executionFilter(input);
            });
        }

        if (this.type == "DATE" || this.type == "DATETIME" || this.type == "DATE-RANGE") {
            flatpickr(input, {
                "mode": (this.type == "DATE-RANGE") ? "range" : "single",
                "dateFormat": "d.m.Y",
                // "positionElement": document.querySelector("wj-table-search-element"),
                "onChange": (selectedDate) => {
                    if(this.type == "DATE-RANGE" && selectedDate.length == 2) {
                        let date = selectedDate.map(d => moment(d).format("x"))
                        input.value = date[0];
                        range.value = date[1];
                        this.executionFilter(input, range);
                    }

                    if (this.type == "DATE") {
                        let date = selectedDate.map(d => moment(d).format("x"))
                        input.value = date[0];
                        this.executionFilter(input);
                    }
                },

                "onOpen": (selectedDates, dateStr, instance) => {
                    // tablePopup.hideable = false;
                },
                "onClose": (selectedDates, dateStr, instance) => {
                    // tablePopup.hideable = true;
                }
            });
        }

        input.addEventListener("keyup", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if(e.key.toUpperCase() == "ENTER"){
                this.executionFilter(input);
            }
        });

        div.appendChild(input);
        if(range)
            div.appendChild(range);

        this.dropdown = div;

        return div;
    }

    executionFilter(input, range){
        let table = WjTable.getInstance(this.tableId).table;
        let filter = store.getState()["filterObj-" + this.tableId].filter;
        let text = (this.type != "DATE-RANGE" && this.type != "NUMBER-RANGE") ? input.value : moment(+input.value).format("L") + " - " + moment(+range.value).format("L");

        if (input.tagName == "SELECT") {
            text = input.selectedOptions[0].text;
        }

        let result = filter.flat().map(f => {
            delete this.filter.func;

            if(JSON.stringify(f) == JSON.stringify(this.filter)) {
                f.value = (this.type != "DATE-RANGE" && this.type != "NUMBER-RANGE") ? [input.value] : [input.value, range.value];
                f.text = text;
            }
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

        store.dispatch(defaultStoreActions.addAction("filterObj-" + this.tableId)({
            "filter": result,
            "table": this.tableId
        }));

        table.setFilter(result.map(a => {
            if(Array.isArray(a))
                return a;
            return [a];
        }));
    }
}

let __esModule = "true";
export { __esModule };

customElements.get(FilterDropdown.is) || customElements.define(FilterDropdown.is, FilterDropdown);
