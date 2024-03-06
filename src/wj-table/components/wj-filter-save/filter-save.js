import { default as WJElement} from "/templates/net/assets/js/components/wj-element.js?v=@@version@@";
import { Service } from '../../service/service.js?v=@@version@@';
import "../../wj-table.js?v=@@version@@";

const template = document.createElement("template");
template.innerHTML = `
<style>
    @import "/templates/net/assets/plugins/bootstrap/css/bootstrap.css?v=@@version@@";
    @import "/templates/net/pages/css/themes/net-basic.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/fontawesome.css?v=@@version@@";
    @import "/templates/net/assets/plugins/font-awesome/css/light.min.css?v=@@version@@";
    @import "/templates/net/assets/js/components/wj-table/components/wj-filter-save/css/styles.css?v=@@version@@";
</style>`;

export default class FilterSave extends WJElement {
    constructor() {
        super(template);
    }

    static get observedAttributes(){
        return ['title','url'];
    }

    get title(){
        return this.getAttribute('title')
    }

    set title(title){
        return this.setAttribute('title', title)
    }

    get endpoint(){
        return this.getAttribute("endpoint")
    }

    set endpoint(endpoint){
        return this.setAttribute("endpoint", endpoint)
    }

    get url(){
        return this.getAttribute('url')
    }

    set url(url){
        return this.setAttribute('url', url)
    }

    get value(){
        return this.context.querySelector('[type="text"]').value
    }

    draw(context, store, params) {
        let element = document.createElement('template');
        element.innerHTML = `<div class="heading">
            <button class="btn btn-success btn-sm">${this.title}</button>
        </div>

        <form class="input">
            <div class="input-group">
                <div class="form-input-group">
                    <input type="text" placeholder="Názov filtra" class="form-control" maxlength="24" />
                </div>
                <div class="input-group-append buttons">
                    <button class="btn btn-success btn-save" role="button" type="button"><i class="fa-light fa-plus"></i></button>
                </div>
            </div>
        </form>`;
        return element.content.cloneNode(true);
    }

    afterDraw(context) {
        this.form = context.querySelector("form");
        this.heading = context.querySelector(".heading");
        this.btnSave = context.querySelector(".btn-save");

        context.querySelector(".heading").addEventListener('click', (e) => {
            e.preventDefault()
            e.stopImmediatePropagation()
            e.stopPropagation();

            this.form.classList.add("open");
            this.form.classList.add("fade-in");

            this.heading.classList.remove('fade-in');
            this.heading.classList.add("fade-out");
        });

        this.btnSave.addEventListener('click', e => {
            // console.log("POST", this.table.element.id, this.store.getState()["filterObj-" + this.table.element.id])

            this.save();
        });
    }

    save(){
        return Service.saveTab("POST", this.endpoint,{
            filter: Service.btoa_utf8(JSON.stringify(this.store.getState()["filterObj-" + this.table.element.id].filter)),
            url: this.table.options.ajaxURL,
            sort: "",
            tab: this.context.querySelector('[type="text"]').value
        }).then(res => {
            // this.title = res.data;
            this.refresh();

            let nav = this.store.getState().nav.map(i => {
                i.active = false;

                return i;
            });

            res.data.active = true;
            nav.push(res.data);

            this.store.dispatch(this.defaultStoreActions.loadAction('nav')(nav));

            // this.table.element.getRootNode().querySelector("wj-nav").data = this.store.getState().nav;
            // this.table.element.getRootNode().querySelector("wj-nav").refresh().then(() => {
            //     this.table.element.getRootNode().host.querySelector("wj-table-options").refresh();
            // });
            intranet.notification(res);
        }).catch(res => {
            intranet.notification(res);

            this.dispatchError(res);
        })
    }

    dispatchEdit(value){
        document.dispatchEvent(
            new CustomEvent("wj-filter-save-save", {
                bubbles: true,
                detail: {
                    value: value,
                    element: this
                }
            })
        );
    }

    dispatchResponse(value){
        document.dispatchEvent(
            new CustomEvent("wj-filter-save-response", {
                bubbles: true,
                detail: {
                    value: value,
                    element: this
                }
            })
        );
    }

    dispatchError(value){
        document.dispatchEvent(
            new CustomEvent("wj-filter-save-error", {
                bubbles: true,
                detail: {
                    value: value,
                    element: this
                }
            })
        );
    }
}

let __esModule = 'true';
export {__esModule};

customElements.get("wj-filter-save") || customElements.define("wj-filter-save", FilterSave);