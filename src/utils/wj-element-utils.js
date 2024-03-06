export class WjElementUtils {
    constructor() {}

    /**
     *
     * @param element : HTMLElement
     * @param object : Object
     */
    static setAttributesToElement(element, object){
        Object.entries(object).forEach(([key,value]) =>{
            element.setAttribute(key, value)
        })
    }

    /** @function getAttributes
     * @description Vráti všetky atributy elementu v poli
     * @return (array)
     */

    static getAttributes(el) {
        if (typeof el === "string")
            el = document.querySelector(el);

        return Array.from(el.attributes)
            .filter(a => !a.name.startsWith("@"))
            .map(a => [a.name.split("-").map((s, i) => {
                if (i != 0) {
                    return s.charAt(0).toUpperCase() + s.slice(1);
                } else {
                    return s;
                }
            }).join(""), a.value])
            .reduce((acc, attr) => {
                acc[attr[0]] = attr[1]
                return acc
            }, {})
    }

    static getEvents(el) {
        if (typeof el === "string")
            el = document.querySelector(el);

        return Array.from(el.attributes)
            .filter(a => a.name.startsWith("@wj"))
            .map(a => [a.name.substring(3).split("-").join(""), a.value])
            .reduce((acc, attr) => {
                acc.set(attr[0], attr[1])
                return acc
            },new Map());
    }

    static attributesToString( object){
        return Object.entries(object).map(([key,value]) =>{
            return `${key}="${value}"`
        }).join(' ')
    }

    static hasSlot(el, slotName = null) {
        let selector = slotName ? `[slot="${slotName}"]` : "[slot]";

        return el.querySelectorAll(selector).length > 0 ? true : false;
    }

    static stringToBoolean(string) {
        return !["false", "0", 0].includes(string)
    }
}