import { default as WJElement } from "/templates/net/assets/js/components/wj-element.js";
import { Service } from '../../service/service.js?v=@@version@@';
import "../wj-filter-save/filter-save.js?v=@@version@@";

const template = document.createElement("template");
template.innerHTML = `<style>
    @import "/templates/net/pages/css/themes/net-basic/buttons.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic/form_elements.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic/checkbox.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/fontawesome.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/light.min.css";
    
    :host {
        margin: 1rem 0 1rem auto;
        min-height: 28px;
        display: flex;
        align-items: center;
    }
    
    :host wj-dropdown {
        margin-left: 1rem;
    }
</style>`;

export default class Options extends WJElement {
    constructor() {
        super(template);

        this.store.subscribe("nav", (key, state, oldState) => {
            this.refresh();
        });
    }

    beforeDraw() {
        this.tableId = this.table.element.id;
    }

    draw(context, store, params) {
        let fragment = new DocumentFragment();

        let slot = document.createElement("slot");
        fragment.appendChild(slot)
        fragment.appendChild(this.btnVisibility());
        if(this.data.length){
            fragment.appendChild(this.btnExport());
        }

        return fragment;
    }

    afterDraw() {
        this.innerHTML = "";
        if (this.table.filterable == "ADVANCED") {
            let navActive = this.store.getState().nav?.find(i => i.active);
            if (navActive?.id == 0 || !navActive) {
                this.appendChild(this.filterNew());
            } else {
                this.appendChild(this.filterEdit(navActive));
            }
        }

        document.addEventListener('wj-nav-change', (e) => {
            this.innerHTML = "";
            if(e.detail.data.id == 0) {
                this.appendChild(this.filterNew());
            } else {
                this.appendChild(this.filterEdit(e.detail.data));
            }
        });
    }

    filterNew() {
        let element = document.createElement("wj-filter-save");
        element.setAttribute("shadow", "open");
        element.setAttribute("endpoint", "/private/rest/hub/tabulator/filter");
        element.setAttribute("title", "Uložiť filter");
        element.table = this.table;

        return element;
    }

    filterEdit(item) {
        let fragment = new DocumentFragment();

        // Ulozennie filtra do existujucej navigacie
        let saveBtn = document.createElement("button");
        saveBtn.classList.add("btn", "btn-success", "btn-sm", "mr-2");
        saveBtn.innerHTML = "Uložiť";
        saveBtn.addEventListener("click", () => {
            let newData = item;
            newData.filter = Service.btoa_utf8(JSON.stringify(this.store.getState()["filterObj-" + this.tableId].filter));

            Service.saveTab("PUT", "/private/rest/hub/tabulator/filter/" + newData.id, newData).then((res) => {
                let nav = Service.setNavActive(item.id, res.data);

                this.store.dispatch(this.defaultStoreActions.loadAction("nav")(nav));

                intranet.notification(res);
            });
        });

        // Zmazanie existujuceho filtra
        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "btn-default", "btn-sm");
        deleteBtn.innerHTML = "Zmazať";
        deleteBtn.addEventListener("click", () => {
            Service.deleteTab("/private/rest/hub/tabulator/filter/" + item.id).then((res) => {
                this.store.dispatch(this.defaultStoreActions.deleteAction("nav")(item));
                let nav = Service.setNavActive(0, res.data);
                this.store.dispatch(this.defaultStoreActions.loadAction("nav")(nav));

                let filterArray = JSON.parse(Service.atob_utf8(this.store.getState().nav[0].filter));
                this.store.dispatch(this.defaultStoreActions.addAction("filterObj-" + this.tableId)({
                    "filter": filterArray,
                    "table": this.tableId
                }));

                intranet.notification(res);
            });
        });

        fragment.appendChild(saveBtn);
        fragment.appendChild(deleteBtn);

        return fragment;
    }

    btnVisibility() {
        let slot = document.createElement("span");
        slot.setAttribute("slot", "button");
        slot.innerHTML = '<i class="fa-light fa-gear"></i>';

        let visibility = document.createElement("wj-dropdown");
        visibility.setAttribute("slot-button", "true");
        visibility.setAttribute("position", "bottom-left");
        visibility.appendChild(slot);
        visibility.classList.add("mr-3", 'd-inline-block');
        // visibility.style.display = 'inline-block';
        visibility.appendChild(this.visibility(this.table.getColumns()));

        return visibility;
    }

    visibility(columns) {
        let visibility = document.createElement('div');
        visibility.classList.add('wrapper-visibility');

        for (let column of columns) {
            if (column.getDefinition().title != undefined) {
                let input = document.createElement('input');
                input.setAttribute('type', 'checkbox');
                input.id = 'checkbox-' + column.getDefinition().field;
                input.checked = column.isVisible();
                input.addEventListener('click', (e) => {
                    column.toggle();

                    if (column.isVisible()) {
                        this.checked = true;
                    } else {
                        this.checked = false;
                    }
                });
                let wrapper = document.createElement("div");
                wrapper.classList.add("form-check");

                let label = document.createElement('label');
                label.classList.add('m-0');
                label.textContent = column.getDefinition().title;
                label.setAttribute('for', 'checkbox-' + column.getDefinition().field);

                wrapper.appendChild(input);
                wrapper.appendChild(label);

                visibility.appendChild(wrapper);
            }
        }

        return visibility;
    }

    btnExport() {
        let slot = document.createElement("span");
        slot.setAttribute("slot", "button");
        slot.innerHTML = '<i class="fa-light fa-arrow-down-to-line"></i>';

        let visibility = document.createElement("wj-dropdown");
        visibility.setAttribute("slot-button", "true");
        visibility.setAttribute("position", "bottom-left");
        visibility.classList.add('d-inline-block');

        visibility.appendChild(slot);

        this.data.forEach(button => {
            visibility.appendChild(this.export(button));
        });

        return visibility;
    }

    export(button) {
        let item = document.createElement("div");
        item.classList.add("wj-dropdown-item");
        item.innerHTML = button.icon + button.title;
        item.addEventListener("click", (e) => {
            this.table.download(button.type, button.filename)
        });

        return item;
    }
}

let __esModule = "true";
export {__esModule};

customElements.get("wj-table-options") || customElements.define("wj-table-options", Options);
