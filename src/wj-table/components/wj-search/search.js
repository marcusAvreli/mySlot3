import { UniversalService } from "/templates/net/assets/js/service/universal-service.js?v=@@version@@";
import { defaultStoreActions, store } from "/templates/net/assets/js/store/store.js?v=@@version@@";
import "/templates/net/assets/plugins/flatpickr/flatpickr.js?v=@@version@@";
import "/templates/net/assets/plugins/flatpickr/l10n/sk.js?v=@@version@@";
import "/templates/net/assets/plugins/flatpickr/plugins/monthSelectPlugin.js?v=@@version@@";

const template = document.createElement("template");
template.innerHTML = `<style>
    @import "/templates/net/assets/plugins/bootstrap/css/bootstrap.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/fontawesome.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/light.min.css";
    @import "/templates/net/pages/css/themes/net-basic/var.css?v=@@version@@";
    @import "/templates/net/assets/plugins/flatpickr/themes/net-basic.css?v=@@version@@";

    :host {
        border-bottom: 1px solid var(--color-border-a);
        border-radius: 5px 5px 0 0;
        /*width: 240px;*/
        /*display: block;*/
    }
        
    .form-range {
        display: flex;
    }
    
    .form-range input {
        flex: 0 0 50%;
        max-width: 50%;
        border-radius: 2px;
    }
    .form-range input:not(:only-child):not(:last-child) {
        border-right-color: transparent;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
    }
    
    .form-range input:last-child {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
    }
    
    .form-range input:not(:only-child):not(:last-child):focus {
        border-right-color: var(--color-primary);
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
    }
    
    .form-range input:last-child:focus {
        border-right-color: var(--color-primary);
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
    }
</style>`;

export default class TableSearchElement extends HTMLElement {
    constructor() {
        super();

        this.service = new UniversalService({
            store: store,
        });

        this.attachShadow({mode:'open'});
    }

    set type(value) {
        return this.setAttribute("type", value.toUpperCase());
    }

    get type() {
        return this.getAttribute("type").toUpperCase();
    }

    set field(value) {
        return this.setAttribute("field", value);
    }

    get field() {
        return this.getAttribute("field");
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.tableId = this.column.getTable().element.id;
        this.columnOptions = store.getState()["columnOptions-" + this.tableId][this.field.split(".")[0]];
        this.filter = [];

        if(store.getState()["filterObj-" + this.tableId].hasOwnProperty("filter")) {
            this.filter = store.getState()["filterObj-" + this.tableId]?.filter;
        }

        this.draw();
    }

    draw() {
        let tablePopup;

        this.column.getTable().on("popupOpened", function([component, popup]){
            tablePopup = popup;
        });

        this.divToggle = document.createElement("div");

        if(this.filter.length > 0) {
            this.divToggle.classList.add("btn-group", "btn-group-toggle");
            this.divToggle.setAttribute("data-toggle", "buttons");

            this.labelAnd = document.createElement("label");
            this.labelAnd.classList.add("btn", "btn-default", "btn-xs", "active");
            this.labelAnd.innerText = "AND";

            this.inputAnd = document.createElement("input");
            this.inputAnd.value = "AND";
            this.inputAnd.setAttribute("name", "options");
            this.inputAnd.setAttribute("type", "radio");
            this.inputAnd.setAttribute("checked", "");

            this.labelAnd.append(this.inputAnd);
            this.divToggle.appendChild(this.labelAnd);

            this.labelOr = document.createElement("label");
            this.labelOr.classList.add("btn", "btn-default", "btn-xs");
            this.labelOr.innerText = "OR";

            this.inputOr = document.createElement("input");
            this.inputOr.value = "OR";
            this.inputOr.setAttribute("name", "options");
            this.inputOr.setAttribute("type", "radio");

            this.labelOr.append(this.inputOr);
            this.divToggle.appendChild(this.labelOr);

            let myFce = (e) => {
                this.divToggle.querySelectorAll("label").forEach(el => {
                   el.classList.remove("active");
                });
                e.target.closest("label").classList.add("active");
            }

            this.inputAnd.addEventListener('change', myFce)
            this.inputOr.addEventListener('change', myFce)
        } else {
            this.divToggle.innerHTML = "Pridať podmienku";
        }

        this.whereAndOr = document.createElement("div");
        this.whereAndOr.classList.add("mb-2");
        this.whereAndOr.append(this.divToggle);

        this.elTitle = document.createElement("div");
        this.elTitle.classList.add("mb-2", "font-weight-bold");
        this.elTitle.innerText = this.title;

        this.search = document.createElement("button");
        this.search.classList.add("btn", "btn-primary", "btn-xs");
        this.search.setAttribute("id", "search");
        this.search.innerText = "Použiť filter";

        // OPERATOR - select nebude zobrazeny len pri tychto typoch
        if (this.type != "DATE-RANGE" && this.type != "NUMBER-RANGE") {
            this.operator = document.createElement("select");
            this.operator.innerHTML = this.getFilterByType(this.type).map((i) => `<option value="${i.operator}" ${i.default ? "selected" : ""}>${i.text}</option>`).join(" ");
            this.operator.classList.add("form-control", "input-sm");

            this.divOperator = document.createElement("div");
            this.divOperator.classList.add("form-group");
            this.divOperator.appendChild(this.operator);
        }

        if (this.type == "DATE" || this.type == "DATETIME" || this.type == "TIME" || this.type == "DATE-RANGE" || this.type == "NUMBER" || this.type == "STRING" || this.type == "NUMBER-RANGE") {
            this.input = document.createElement("input");
            this.input.setAttribute("type", (this.type == "NUMBER" || this.type == "NUMBER-RANGE") ? "number" : "text");
            this.input.setAttribute("placeholder", "Filtrovať podľa " + this.title);
            this.input.classList.add("form-control", "input-sm");

            this.divInput = document.createElement("div");
            this.divInput.classList.add("form-group");
            this.divInput.appendChild(this.input);

            if (this.type == "NUMBER-RANGE") {
                this.input.setAttribute("placeholder", "Od");
                this.divInput.classList.add("form-range");
            }
        }

        if (this.type == "DATE-RANGE" || this.type == "NUMBER-RANGE") {
            this.range = document.createElement("input");
            this.range.classList.add("form-control", "input-sm");
            this.range.setAttribute("type", "number");
            this.range.setAttribute("placeholder", "Do");
            if (this.type == "DATE-RANGE")
                this.range.setAttribute("type", "hidden");

            this.divInput.appendChild(this.range);
        }

        if (this.type == "BOOLEAN" || this.type == "OPTION" || this.type == "MULTISELECT") {
            this.input = document.createElement("select");
            this.input.innerHTML = this.columnOptions.map((i) => `<option value="${i.id}">${i.name}</option>`).join(" ");
            this.input.classList.add("form-control", "input-sm");

            this.divInput = document.createElement("div");
            this.divInput.classList.add("form-group");
            this.divInput.appendChild(this.input);
        }

        if(!!this.whereAndOr)
            this.shadowRoot.append(this.whereAndOr);

        if(!!this.elTitle)
            this.shadowRoot.append(this.elTitle);

        if(!!this.divOperator)
            this.shadowRoot.append(this.divOperator);

        if(!!this.divInput)
            this.shadowRoot.append(this.divInput);

        // if(!!this.divRange)
        //     this.shadowRoot.append(this.divRange);

        if(!!this.search)
            this.shadowRoot.append(this.search);

        if (this.type == "DATE" || this.type == "DATETIME" || this.type == "DATE-RANGE") {
            flatpickr(this.input, {
                "mode": (this.type == "DATE-RANGE") ? "range" : "single",
                "dateFormat": "d.m.Y",
                "positionElement": document.querySelector("wj-table-search-element"),
                "onChange": (selectedDate) => {
                    if(this.type == "DATE-RANGE" && selectedDate.length == 2) {
                        let date = selectedDate.map(d => moment(d).format("x"))
                        this.input.value = date[0];
                        this.range.value = date[1];
                        this.executionFilter();
                        tablePopup.hideable = true;
                    }

                    if (this.type == "DATE") {
                        let date = selectedDate.map(d => moment(d).format("x"))
                        this.input.value = date[0];
                        this.executionFilter();
                        tablePopup.hideable = true;
                    }
                },

                "onOpen": (selectedDates, dateStr, instance) => {
                    tablePopup.hideable = false;
                },
                "onClose": (selectedDates, dateStr, instance) => {
                    tablePopup.hideable = true;
                }
            });
        }

        if(!!this.search) {
            this.search.addEventListener("click", this.executionFilter);
        }

        this.addEventListener("keyup", (e) => {
            if(e.key.toUpperCase() == "ENTER"){
                tablePopup.hideable = true;
                this.executionFilter();
            }
        });
    }

    executionFilter = () => {
        // nastavime this.filter
        this.addFilter();

        store.dispatch(defaultStoreActions.addAction("filterObj-" + this.tableId)({
            "filter": this.filter,
            "table": this.column.getTable().element.id
        }));

        this.column.getTable().setFilter(this.filter.map(a => {
            if(Array.isArray(a))
                return a;
            return [a];
        }));

        this.column.getElement().classList.add("filtered");
    }

    addFilter() {
        let option = (this.filter.length > 0) ? this.shadowRoot.querySelector('[name="options"]:checked')?.value : "WHERE";

        let title = this.title;
        let field = this.field;
        let type = (this.type != "DATE-RANGE" && this.type != "NUMBER-RANGE") ? this.operator.selectedOptions[0].value : "btwn";
        let inputType = this.type;
        let value = (this.type != "DATE-RANGE" && this.type != "NUMBER-RANGE") ? [this.input.value] : [this.input.value, this.range.value];
        let text = (this.type != "DATE-RANGE" && this.type != "NUMBER-RANGE") ? this.input.value : moment(+this.input.value).format("L") + " - " + moment(+this.input.value).format("L");

        if (this.input.tagName == "SELECT") {
            text = this.input.selectedOptions[0].text;
        }

        let result = {
            "title": title,
            "field": field,
            "type": type,
            "value": value,
            "inputType": inputType,
            "option": option,
            "text": text
        };

        if(option == "OR") {
            if(Array.isArray(this.filter[this.filter.length - 1])) {
                this.filter[this.filter.length - 1].push(result);
            } else {
                this.filter = Array.from(this.filter, (x, i) => {
                    if(i == this.filter.length - 1)
                        return [x, result];

                    return x;
                });
            }
            return;
        }

        this.filter?.push(result);
    }

    getFilterByType(type = "STRING") {
        return this.filterType().reduce((acc, next) => {
            if(next.type.includes(type)) {
                if(next.default?.includes(type))
                    next.default = true

                acc.push(next);
            }
            return acc;
        }, []);
    }

    filterType() {
        return [{
            text: "Je",
            operator: "eq",
            type: ["DATE", "STRING", "NUMBER", "BOOLEAN", "OPTION"],
            default: ["NUMBER", "BOOLEAN", "OPTION"]
        },{
            text: "Nie je",
            operator: "neq",
            type: ["DATE", "STRING", "NUMBER", "BOOLEAN", "OPTION"]
        },{
            text: "Menší",
            operator: "lt",
            type: ["DATE", "NUMBER"],
        },{
            text: "Väčší",
            operator: "gt",
            type: ["DATE", "NUMBER"]
        },{
            text: "Menší alebo sa rovná",
            operator: "lte",
            type: ["DATE", "NUMBER"]
        },{
            text: "Väčší alebo sa rovná",
            operator: "gte",
            type: ["DATE", "NUMBER"],
        },{
            text: "Obsahuje",
            operator: "like",
            type: ["STRING"],
            default: ["STRING"]
        },{
            text: "Neobsahuje",
            operator: "nlike",
            type: ["STRING"],
        },{
            text: "Začína",
            operator: "swith",
            type: ["STRING"],
        },{
            text: "Končí",
            operator: "ewith",
            type: ["STRING"]
        },{
            text: "Nachádza sa",
            operator: "in",
            type: ["MULTISELECT"]
        },{
            text: "Nenachádza sa",
            operator: "nin",
            type: ["MULTISELECT"]
        }];
    }
}

let __esModule = "true";
export {__esModule};

customElements.get("wj-table") || customElements.define("wj-table-search-element", TableSearchElement);
