var self;

class WjEvent {
    constructor() {
        this.customEventStorage = [];
        self = this;
    }

    dispatch(e) {
        let element = this;
        let record = self.findRecordByElement(element);
        let listeners = record.listeners[e.type];

        listeners.forEach((listener, i) => {
            self.dispatchCustomEvent(element, listener.event, {
                originalEvent: e.type || null,
                context: element,
                event: self
            });

            if(listener.options && listener.options.stopPropagation === true)
                e.stopPropagation();
        });
    }

    dispatchCustomEvent(element, event, detail) {
		

        element.dispatchEvent(
            new CustomEvent(event, {
                detail: detail,
                bubbles: true,
                composed: true
            })
        );
    }

    findRecordByElement (element) {
        for (var index = 0, length = this.customEventStorage.length; index < length; index++) {
            var record = this.customEventStorage[index];

            if (element == record.element) {
                return record;
            }
        }

        return false;
    }

    addListener (element, originalEvent, event, listener, options) {
        if(!element)
            return;

        let record = this.findRecordByElement(element);

        if (record) {
            record.listeners[originalEvent] = record.listeners[originalEvent] || [];
        }
        else {
            record = {
                element: element,
                listeners: {}
            };

            // vytvorime object listeners pre kazdy original event zvlast
            record.listeners[originalEvent] = [];

            this.customEventStorage.push(record);
        }
        listener = listener || this.dispatch;
        let obj = {
            listener: listener,
            options: options,
            event: event
        };

        // skontrolujeme ci uz tento listener neexistuje
        if(!this.listenerExists(element, originalEvent, obj)) {
            record.listeners[originalEvent].push(obj);

            element.addEventListener(originalEvent, listener);
        }
    }

    listenerExists (element, event, listener) {
        let record = this.findRecordByElement(element);

        return record.listeners[event].some((e) => JSON.stringify(e) === JSON.stringify(listener));
    }

    removeListener (element, originalEvent, event, listener, options) {
        let record = this.findRecordByElement(element);

        if (record && originalEvent in record.listeners) {
            var index = record.listeners[originalEvent].indexOf(listener);

            if (~index) {
                record.listeners[originalEvent].splice(index, 1);
            }

            if (!record.listeners[originalEvent].length) {
                delete record.listeners[originalEvent];
            }
        }

        listener = listener || this.dispatch;

        element.removeEventListener(originalEvent, listener, options);
    }

    removeElement (element) {
        this.customEventStorage = this.customEventStorage.filter((e) => {
            if(e.element !== element)
                return e;
        });
    }
}

let event = new WjEvent();
export { event };