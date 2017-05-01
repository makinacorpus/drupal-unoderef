/**
 * µNodeReference Dragula based code.
 */
namespace UNodeRef {

    export const DATA_BUNDLES = "data-allowed-bundles";
    export const DATA_ITEM_BUNDLE = "data-bundle";
    export const DATA_ITEM_ID = "data-id";
    export const DATA_ITEM_TYPE = "data-type";
    export const SELECTOR_SOURCES = "[data-layout-source=\"1\"]";
    export const SELECTOR_WIDGET = ".unoderef-items";

    /**
     * Reprensents a base widget
     */
    class Widget {

        allowedBundles: string[] | null;
        container: Element;
        drake: dragula.Drake;
        valueInput: HTMLInputElement;

        /**
         * Default constructor
         */
        constructor(container: Element) {
            this.container = container;

            // Value element is always a sibling, find it
            if (!this.container.parentElement) {
                throw "Cannot find parent container";
            }
            const node = this.container.parentElement.querySelector("input[type=hidden]");
            if (node instanceof HTMLInputElement) {
                this.valueInput = node;
            } else {
                throw "Cannot find hidden input";
            }

            // Parse allowed bundles
            if (this.container.hasAttribute(DATA_BUNDLES)) {
                const data = this.container.getAttribute(DATA_BUNDLES);
                if (data) {
                    this.allowedBundles = data.split(",");
                }
            }

            // Refresh items, upon initial page build they do not have the
            // correct wrapper and remove button
            for (let child of <any>this.container.childNodes) {
                this.addItem(child);
            }
        }

        /**
         * Refresh value
         */
        refreshValue(): void {
            const order: string[] = [];
            for (let child of <any>this.container.childNodes) {
                const id = child.getAttribute(DATA_ITEM_ID);
                if (id) {
                    order.push(id);
                } else {
                    this.container.removeChild(child);
                }
            }
            this.valueInput.setAttribute('value', order.join(','));
        }

        /**
         * Can this widget accept the given element
         */
        accepts(element: Element): boolean {
            if (!element.hasAttribute(DATA_ITEM_ID) || !element.hasAttribute(DATA_ITEM_TYPE) || 'node' !== element.getAttribute(DATA_ITEM_TYPE)) {
                return false;
            }
            if (this.allowedBundles) {
                const bundle = element.getAttribute(DATA_ITEM_BUNDLE);
                if (bundle) {
                    return -1 !== this.allowedBundles.indexOf(bundle);
                }
            }
            return true;
        }

        /**
         * Remove all items
         */
        removeAllItems(): void {
            for (let child of <any>this.container.childNodes) {
                this.container.removeChild(child);
            }
        }

        /**
         * Replaces the list element with the correct representation
         */
        addItem(element: Element): void {
            const newElement = this.cloneItem(element);
            try {
                this.container.replaceChild(newElement, element);
            } catch (e) {
                // Element does not exists in container, append child instead
                this.container.appendChild(newElement);
            }
            this.refreshValue();
        }

        /**
         * Clone item on drop
         */
        cloneItem(element: Element): Element {
            const newElement = document.createElement('div');
            newElement.className = 'unoderef-item';
            newElement.setAttribute(DATA_ITEM_TYPE, <string>element.getAttribute(DATA_ITEM_TYPE));
            newElement.setAttribute(DATA_ITEM_BUNDLE, <string>element.getAttribute(DATA_ITEM_BUNDLE));

            const innerClone = <Element>element.cloneNode(true);
            innerClone.removeAttribute('class');
            newElement.appendChild(innerClone);

            // Create close button
            const closeButton = document.createElement('span');
            closeButton.setAttribute("class", "glyphicon glyphicon-remove");
            newElement.appendChild(closeButton);

            // Attach remove button behavior
            closeButton.onclick = () => {
                if (newElement.parentElement) {
                    newElement.parentElement.removeChild(newElement);
                    this.refreshValue();
                }
            };

            return newElement;
        }
    }

    /**
     * Initialiaze a single widget
     */
    export function initializeWidget(node: Element): void {

        // Find all potential sources in document, in order to make it
        // easier for everybody, we re-use the phplayout and ucms sources
        // so it'll work globally transparently.
        const sources: Element[] = [];
        for (let source of <any>document.querySelectorAll(SELECTOR_SOURCES)) {
            sources.push(source);
        };

        // No sources mean that the widgets cannot work.
        if (!sources.length) {
            return;
        }

        // FIXME re-implement this properly
        // Handle browser refresh, if no items are displayed and hidden field is
        // not empty, search for items in page or empty hidden field.
        //          if (!$list.find('.unoderef-item').length && hidden.getAttribute('value')) {
        //            const found = true;
        //            $.each(hidden.getAttribute('value').split(','), function (nid) {
        //              $('[data-item-id=' + nid + ']').clone().attr('class', '').addClass('unoderef-item').appendTo($list);
        //            });
        //            if (!found) {hidden.setAttribute('value', "");}
        //          }

        const widget = new Widget(node);
        const allContainers: Element[] = sources.concat([widget.container]);
        widget.drake = dragula(allContainers, {
            copy: true,
            accepts: (element: Element, target: Element) => target === widget.container && widget.accepts(element),
            // invalid: (element: Element) => !$(element).closest('[data-item-type]').length,
            revertOnSpill: true,
            removeOnSpill: false,
            direction: 'horizontal'
        });

        if (!widget.container.getAttribute('data-multiple')) {
            widget.drake.on('drop', function(element: Element) {
                widget.removeAllItems();
                widget.addItem(element);
            });
        } else {
            widget.drake.on('drop', function(element: Element) {
                widget.addItem(element);
            });
        }
    }
}
