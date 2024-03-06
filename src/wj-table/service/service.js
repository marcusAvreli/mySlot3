import { default as WJElement, WjElementUtils } from "../../wj-element/wj-element.js";
import { default as Tabulator} from 'tabulator-tables';
// import { TabulatorFull, RowComponent} from "../plugins/tabulator/js/tabulator_esm.js?v=@@version@@";

// import "../components/wj-action-dropdown/action-dropdown.js?v=@@version@@";

// import "/templates/net/assets/js/hub-profile-photo.js?v=@@version@@";
class TabulatorFull extends Tabulator {}
import * as styles from "../scss/styles.css";
export class Service extends WJElement {
    constructor() {
        super();
console.log("Service_constructor");
        String.prototype.interpolate = function(params) {
            let template = this;
            let keys = template.match(/\{.*?\}/g);

            if(keys) {
                for (let key of keys) {
                    let cleanKey = key.replace("{", "").replace("}", "");
                    let val = "";

                    cleanKey.split(".").forEach(k => {
                        val = (val == "") ?  params[k] : val[k]
                    });

                    template = template.replace(key, val);
                }
            }
            return template;
        }
/*
        TabulatorFull.extendModule("filter", "filters", {
            "eq": () => {
                return;
            },
            "neq": () => {
                return;
            },
            "like": () => {
                return;
            },
            "startsWith": () => {
                return;
            },
            "endsWith": () => {
                return;
            },
            "lt": () => {
                return;
            },
            "lte": () => {
                return;
            },
            "gt": () => {
                return;
            },
            "gte": () => {
                return;
            },
            "in": () => {
                return;
            },
            "btwn": () => {
                return;
            },
        });

        TabulatorFull.extendModule("localize", "langs", {
            "sk-sk":{
                "columns": {
                    "name":"Názov", //replace the title of column name with the value "Name"
                },
                "data": {
                    "loading":"Načítavam dáta", //data loader text
                    "error":"Error", //data error text
                },
                "groups": { //copy for the auto generated item count in group header
                    "item": "item", //the singular  for item
                    "items": "items", //the plural for items
                },
                "pagination": {
                    "page_size":"Počet záznamov na stránke", //label for the page size select element
                    "page_title": "Show Page",//tooltip text for the numeric page button, appears in front of the page number (eg. "Show Page" will result in a tool tip of "Show Page 1" on the page 1 button)
                    "first":"First", //text for the first page button
                    "first_title":"Prvá stránka", //tooltip text for the first page button
                    "last":"Last",
                    "last_title":"Posledná stránka",
                    "prev":"",
                    "prev_title":"Predchádzajúca stránka",
                    "next":"",
                    "next_title":"Ďalšia stránka",
                    "all":"All",
                    "counter":{
                        "showing": "Zobrazujem",
                        "of": "of",
                        "rows": "rows",
                        "pages": "pages",
                    }
                },
                "headerFilters": {
                    "default":"", //default header filter placeholder text
                    "columns":{
                        "name":"", //replace default header filter text for column name
                    }
                }
            }
        });

        TabulatorFull.extendModule("format", "formatters", {
            "wj-actions": this.wjActions,
            "wj-actions-modal": this.wjActionsModal,
            "wj-badge": this.wjBadge,
            "wj-colored-circle": this.wjColoredCircle,
            "wj-colored-dot": this.wjColoredDot,
            "wj-date": this.wjDate,
            "wj-datetime": this.wjDatetime,
            "wj-fontawesome": this.wjFontawesome,
            "wj-modal-delete": this.wjModalDelete,
            "wj-postfix": this.wjPostfix,
            "wj-prefix": this.wjPrefix,
            "wj-profile-photo": this.wjProfilePhoto,
            "wj-router-link": this.wjRouterLink,
            "wj-row-selection": this.wjRowSelection,
            "wj-title-with-description": this.wjTitleWithDescription,
            "wj-header-advanced": this.wjHeaderAdvanced,
        });

        TabulatorFull.extendModule("edit", "editors", {
            headerMenu: this.headerMenu
        });
		*/
    }
   static get cssStyleSheet() {
	   console.log("service get css:"+styles);
	   console.log("service get css:"+JSON.stringify(styles));
	   
	   
        return styles;
    }

    setupAttributes() {
        this.isShadowRoot = "open";
    }

    set tableId(value) {
        this.setAttribute("table-id", value);
    }

    get tableId() {
        return this.getAttribute("table-id");
    }

    extendFormatters(formatter) {
        TabulatorFull.extendModule("format", "formatters", formatter);
    }

    wjActions(cell, formatterParams, onRendered){
        try {
            let rowData = cell.getRow().getData();
            let el = formatterParams.map(wjmo => {
                let { action, display, title, callback, text, size, url, type, footerHide, attributes } = wjmo;

                let interpolateUrl = url.interpolate(rowData);
                let icon = this.icons[type.toLowerCase()].icon;
                let customAttributes = attributes.interpolate(rowData);
                switch (action) {
                    case "wj-modal-delete":
                        return `<hub-modal-open ${customAttributes} display="${display}" url="${interpolateUrl}" size="${size}" title="${title}" alert="${callback}" text="${text}" class="btn btn-link">
                            <i class="${icon}"></i>
                        </hub-modal-open>`;
                    default:
                        return `<hub-modal-open ${customAttributes} url="${interpolateUrl}" size="${size}" ${footerHide ? "footer-hide=\"true\"" : ""} title="" class="btn btn-link">
                            <i class="${icon}"></i>
                        </hub-modal-open>`;
                }
            });
            return el.join("");
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjActionsModal(cell, formatterParams, onRendered) {
        try {
            let rowData = cell.getRow().getData();
            let el = formatterParams.map(wjmo => {
                let { action, display, title, callback, text, size, url, type, footerHide, attributes } = wjmo;

                let interpolateUrl = url.interpolate(rowData);
                let icon = this.icons[type.toLowerCase()].icon;
                let customAttributes = attributes.interpolate(rowData);
                switch (action) {
                    case "wj-modal-delete":
                        return `<wj-menu-item ${customAttributes} display="${display}" url="${interpolateUrl}" size="${size}" title="${title}" alert="${callback}" text="${text}" class="wj-dropdown-item">
                            <i class="${icon}"></i>&nbsp;${title}
                        </wj-menu-item>`;
                    default:
                        return `<wj-menu-item ${customAttributes} url="${interpolateUrl}" size="${size}" ${footerHide ? "footer-hide=\"true\"" : ""} title="${title}" class="wj-dropdown-item">
                            <i class="${icon}"></i>&nbsp;${title}
                        </wj-menu-item>`;
                }
            });

            let dropdown = document.createElement("wj-dropdown");
            dropdown.setAttribute("placement", "bottom-start");
            dropdown.setAttribute("collapse", "");
            dropdown.setAttribute("hide-icon", "");
            dropdown.innerHTML = `<wj-button slot="trigger" variant="link" size="small">
                <wj-icon name="ellipsis-vertical"></wj-icon>
            </wj-button>
            <wj-menu>${el.join("")}</wj-menu>`;

            // RHR: HACK ked bude čas treba fixnut
            // const oldFn = dropdown.getDropdown
            // dropdown.getDropdown = () => {
            //     if(dropdown.dropdownContentElement){
            //         dropdown.dropdownContentElement.innerHTML = el.join("");
            //         return dropdown.dropdownContentElement;
            //     }
            //
            //     const oldEl = oldFn();
            //     oldEl.innerHTML = el.join("");
            //     return oldEl;
            // }
            // dropdown.innerHTML = el.join("");
            return dropdown;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjBadge(cell, formatterParams) {
        try {
            let value = cell.getValue();
            return `<span class="label ${formatterParams.colorPrefix + value.color + "-lighter"}">${value.name}</span>`;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjColoredCircle(cell, formatterParams){
        try {
            let value = cell.getValue();

            let span = document.createElement("span");
            span.classList.add("circle", "bg-" + value.color);
            span.setAttribute("style", "position: absolute; top: 14px;");

            return span;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjColoredDot(cell, formatterParams){
        try {
            let value = cell.getValue();

            let span = document.createElement("span");
            span.classList.add("circle", "bg-" + value.color, "mr-2");

            let wrapper = document.createElement("span");
            wrapper.classList.add("d-flex", "align-items-center");
            wrapper.innerText = value.name;
            wrapper.prepend(span);

            return wrapper;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjDate(cell, formatterParams, onRendered){
        try {
            return `<span class="${formatterParams.class}">${this.date(cell.getValue())}</span>`;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjDatetime (cell, formatterParams){
        try {
            return `<span class="${formatterParams.class}">${this.datetime(cell.getValue())}</span>`;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjFontawesome(cell, formatterParams){
        try {
            if(formatterParams.hasOwnProperty("text"))
                return `<i class="fa-light mr-2">&#x${cell.getValue().icon}</i>${formatterParams.text.interpolate(cell.getValue())}`;

            return `<span class="color-${formatterParams.color}"><i class="fa-light">&#x${cell.getValue().icon};</i></span>`;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjModalDelete(cell, formatterParams){
        try {
            let element = document.createElement("hub-modal-open");
            element.setAttribute("title", formatterParams.title);
            element.setAttribute("display", "stick-up");
            element.setAttribute("size", "medium");
            element.setAttribute("alert", formatterParams.callback);
            element.setAttribute("text", formatterParams.url);
            element.setAttribute("url", formatterParams.url.interpolate(rowData));
            element.innerText = cell.getValue();

            return element;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjPostfix(cell, formatterParams, onRendered){
        try {
            let value = cell.getValue();

            return value + " " + formatterParams.value;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjPrefix (cell, formatterParams, onRendered) {
        try {
            let value = cell.getValue();

            return formatterParams.value + " " + value;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjProfilePhoto(cell, formatterParams){
        try {
            let value = cell.getValue();
            let el = document.createElement("hub-profile-photo");

            if (formatterParams.hasOwnProperty("name")) {
                let span = document.createElement("span");
                span.setAttribute("slot", "name");
                span.innerText = formatterParams.name.interpolate(value);
                el.appendChild(span);
            }

            el.setAttribute("photo", value.photo);
            if (formatterParams.hasOwnProperty("size"))
                el.setAttribute("size", formatterParams.size);

            return el.outerHTML;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjRouterLink(cell, formatterParams){
        try {
            let rowData = cell.getRow().getData();
            return `<a route="${formatterParams.route}" ${formatterParams.attributes.interpolate(rowData)}>${cell.getValue()}</a>`;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjRowSelection(cell, formatterParams, onRendered){
        // debugger
        // var checkbox = document.createElement("input");
        let checkbox = document.createElement("wj-checkbox");
        checkbox.setAttribute("color", "primary");
        checkbox.setAttribute("style", "--wj-checkbox-margin-bottom: 0;");
        var blocked = false;

        if(this.table.modExists("selectRow", true)) {

            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
            });

            let rowActivities = document.createElement("slot");
            rowActivities.setAttribute("name", "row-activities");
            cell.getColumn().getElement().appendChild(rowActivities);

            const toggleActivities = () => {
                let columns = this.table.getColumns();
                let startIndex = columns.findIndex((item) => item === cell.getColumn());

                let countSelectedRows = this.table.getSelectedRows().length;

                columns.slice(++startIndex).forEach(item => {
                    item.getElement().classList.remove("hidden");

                    if(countSelectedRows > 0)
                        item.getElement().classList.add("hidden");
                });

                cell.getColumn().getElement().classList.remove("show");

                if(countSelectedRows > 0)
                    cell.getColumn().getElement().classList.add("show");
            }

            if(typeof cell.getRow == 'function'){
                let row = cell.getRow();
/*
                if(row instanceof RowComponent){
                    checkbox.addEventListener("wj:checkbox:input", (e) => {
                        row.isSelected() ? row.deselect() : row.select();

                        toggleActivities();
                    });

                    this.table.modules.selectRow.registerRowSelectCheckbox(row, checkbox);
                } else {
                    checkbox = "";
                }*/
            } else {
                checkbox.addEventListener("wj:checkbox:input", (e) => {
                    this.table.getRows().forEach(row => {
                        row.isSelected() ? row.deselect() : row.select();
                    });
                    toggleActivities();
                });

                this.table.modules.selectRow.registerHeaderSelectCheckbox(checkbox);
            }
        }

        return checkbox;
    }

    // wjRowSelection = (cell, formatterParams, onRendered) => {
    //     let uuid = this.generateUUID();
    //
    //     let checkbox = document.createElement("wj-checkbox");
    //     checkbox.setAttribute("color", "primary");
    //     checkbox.setAttribute("style", "--wj-checkbox-margin-bottom: 0;");
    //
    //     // let div = document.createElement("div");
    //     // div.classList.add("form-check", "primary");
    //     //
    //     // let label = document.createElement("label");
    //     // label.setAttribute("for", uuid);
    //     //
    //     // let checkbox = document.createElement("input");
    //     // checkbox.id = uuid;
    //     let blocked = false;
    //     //
    //     // checkbox.type = 'checkbox';
    //     // checkbox.setAttribute("aria-label", "Select Row");
    //     if(this.table.modExists("selectRow", true)){
    //
    //         // checkbox.addEventListener("click", (e) => {
    //         //     // e.stopPropagation();
    //         // });
    //         // console.log("CELL", cell, typeof cell.getRow);
    //         if(typeof cell.getRow == 'function'){
    //
    //             let row = cell.getRow();
    //
    //             if(row instanceof RowComponent){
    //
    //                 checkbox.addEventListener("wj:checkbox:change", (e) => {
    //                     console.log("CLIK NA ROW");
    //                     if(this.table.options.selectableRangeMode === "click"){
    //                         if(!blocked){
    //                             row.toggleSelect();
    //                         }else {
    //                             blocked = false;
    //                         }
    //                     }else {
    //                         row.toggleSelect();
    //                     }
    //                 });
    //
    //                 // if(this.table.options.selectableRangeMode === "click"){
    //                 //     checkbox.addEventListener("click", (e) => {
    //                 //         blocked = true;
    //                 //         this.table.modules.selectRow.handleComplexRowClick(row._row, e);
    //                 //     });
    //                 // }
    //
    //                 // checkbox.checked = row.isSelected && row.isSelected();
    //                 // if(row.isSelected && row.isSelected())
    //                 //     checkbox.setAttribute("checked", "");
    //                 // else
    //                 //     checkbox.removeAttribute("checked");
    //
    //                 this.table.modules.selectRow.registerRowSelectCheckbox(row, checkbox);
    //             }else {
    //                 checkbox = "";
    //             }
    //         }else {
    //
    //             checkbox.addEventListener("wj:checkbox:change", (e) => {
    //
    //                 console.log("CLIK NA HEADER");
    //                 if(this.table.modules.selectRow.selectedRows.length){
    //                     this.table.deselectRow();
    //                 }else {
    //                     this.table.selectRow();
    //                     // checkbox.setAttribute("checked", "");
    //                     console.log(this.table.modules.selectRow.selectedRows);
    //                 }
    //             });
    //
    //             this.table.modules.selectRow.registerHeaderSelectCheckbox(checkbox);
    //         }
    //     }
    //
    //     // div.appendChild(checkbox);
    //     // div.appendChild(label);
    //
    //     return checkbox;
    // }

    wjTitleWithDescription (cell, formatterParams){
        try {
            let rowData = cell.getRow().getData();
            let el = document.createElement("span");

            let title = document.createElement("hub-modal-open");
            title.setAttribute("title", "");
            title.setAttribute("size", "x-large");
            title.setAttribute("footer-hide", true);
            title.setAttribute("url", formatterParams.titleHref.interpolate(rowData));
            title.setAttribute("task-id", rowData.id);
            title.innerHTML = `<b>${cell.getValue()}</b>`;

            el.appendChild(title);

            if(formatterParams.hasOwnProperty("description")){
                let description = document.createElement("a");
                description.setAttribute("href", "javascript:void(0);");
                description.setAttribute("route", "dsk.project.detail");
                description.setAttribute("param-project-id", rowData.project.id);
                description.classList.add("small", "d-block");
                description.innerText = formatterParams.description.interpolate(rowData);
                el.appendChild(description);
            }

            return el;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    wjHeaderAdvanced(cell, formatterParams){
        try {
            // <wj-dropdown label="Start" placement="bottom-start" offset="5">
            //     <wj-button size="large" slot="trigger" caret>Large</wj-button>
            //     <wj-menu>
            //         <wj-menu-item>
            //             <wj-icon name="plane" slot="start"></wj-icon>
            //             <wj-label>Menu item</wj-label>
            //         </wj-menu-item>
            //         <wj-menu-item>
            //             <wj-icon name="book" slot="start"></wj-icon>
            //             <wj-label>Menu item</wj-label>
            //         </wj-menu-item>
            //         <wj-menu-item>
            //             <wj-icon name="music" slot="start"></wj-icon>
            //             <wj-label>Menu item</wj-label>
            //         </wj-menu-item>
            //         <wj-menu-item>
            //             <wj-icon name="film" slot="start"></wj-icon>
            //             <wj-label>Menu item</wj-label>
            //         </wj-menu-item>
            //     </wj-menu>
            // </wj-dropdown>
            let fragment = document.createElement("div");
            fragment.classList.add("wj-table-title");


            let el = document.createElement("wj-dropdown");
            el.setAttribute("label", "start");
            el.setAttribute("placement", "button-start");
            el.setAttribute("offset", "5");

            // <wj-button size="large" slot="trigger" caret>Large</wj-button>
            let button = document.createElement("wj-button");
            button.setAttribute("size", "small");
            button.setAttribute("slot", "trigger");
            button.setAttribute("variant", "link");
            button.innerHTML = `<wj-icon name="ellipsis-vertical"></wj-icon>`;

            let menu = document.createElement("wj-menu");
            menu.innerHTML = `<wj-menu-item>Nieco</wj-menu-item>`;

            let text = document.createElement("span");
            text.innerText = cell.getValue();

            el.appendChild(button);
            el.appendChild(menu);

            fragment.appendChild(el);
            fragment.appendChild(text);

            return fragment;
        } catch (error) {
            return formatterParams.invalidPlaceholder;
        }
    }

    date(millis) {
        return (millis) ? moment(millis).format("DD.MM.YYYY") : "";
    }

    datetime(millis) {
        return (millis) ? moment(millis).format("DD.MM.YYYY HH:mm") : "";
    }

    generateUUID() {
        return 'idxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
            const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
            return v.toString(16);
        })
    }

    get icons() {
        return {
            "edit": {
                "icon": "fal fa-pencil",
                "title": "Editácia záznamu"
            },
            "delete": {
                "icon": "fal fa-trash",
                "title": "Zmazanie záznamu"
            },
            "detail": {
                "icon": "fa fa-eye",
                "title": "Detail záznamu"
            }
        };
    }

    static setNavActive(id, data) {
        return store.getState().nav.map(i => {
            if(i.id == id) {
                i = data ? data : i;
                i.active = true;
            } else {
                i.active = false;
            }

            return i;
        });
    }

    static atob_utf8(value) {
        const value_latin1 = atob(value);
        return new TextDecoder('utf-8').decode(
            Uint8Array.from(
                { length: value_latin1.length },
                (element, index) => value_latin1.charCodeAt(index)
            )
        )
    }

    static btoa_utf8(value) {
        return btoa(
            String.fromCharCode(
                ...new TextEncoder('utf-8')
                    .encode(value)
            )
        );
    }

    static saveTab(method, endpoint, data) {
        return fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res =>{
            if(res.ok){
                return res.json();
            } else {
                return res.text;
            }
        });
    }

    static deleteTab(endpoint) {
        return fetch(endpoint, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res =>{
            if(res.ok){
                return res.json();
            } else {
                return res.text;
            }
        });
    }
}



