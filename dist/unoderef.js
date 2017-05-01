"use strict";
Drupal.behaviors.unoderefDragula = {
    attach: function (context) {
        if (!context.querySelectorAll) {
            if (context.get) {
                context = context.get(0);
            }
            else {
                return;
            }
        }
        for (var _i = 0, _a = context.querySelectorAll(UNodeRef.SELECTOR_WIDGET); _i < _a.length; _i++) {
            var node = _a[_i];
            UNodeRef.initializeWidget(node);
        }
    }
};
var UNodeRef;
(function (UNodeRef) {
    UNodeRef.DATA_BUNDLES = "data-allowed-bundles";
    UNodeRef.DATA_ITEM_BUNDLE = "data-bundle";
    UNodeRef.DATA_ITEM_ID = "data-id";
    UNodeRef.DATA_ITEM_TYPE = "data-type";
    UNodeRef.SELECTOR_SOURCES = "[data-layout-source=\"1\"]";
    UNodeRef.SELECTOR_WIDGET = ".unoderef-items";
    var Widget = (function () {
        function Widget(container) {
            this.container = container;
            if (!this.container.parentElement) {
                throw "Cannot find parent container";
            }
            var node = this.container.parentElement.querySelector("input[type=hidden]");
            if (node instanceof HTMLInputElement) {
                this.valueInput = node;
            }
            else {
                throw "Cannot find hidden input";
            }
            if (this.container.hasAttribute(UNodeRef.DATA_BUNDLES)) {
                var data = this.container.getAttribute(UNodeRef.DATA_BUNDLES);
                if (data) {
                    this.allowedBundles = data.split(",");
                }
            }
            for (var _i = 0, _a = this.container.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                this.addItem(child);
            }
        }
        Widget.prototype.refreshValue = function () {
            var order = [];
            for (var _i = 0, _a = this.container.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                var id = child.getAttribute(UNodeRef.DATA_ITEM_ID);
                if (id) {
                    order.push(id);
                }
                else {
                    this.container.removeChild(child);
                }
            }
            this.valueInput.setAttribute('value', order.join(','));
        };
        Widget.prototype.accepts = function (element) {
            if (!element.hasAttribute(UNodeRef.DATA_ITEM_ID) || !element.hasAttribute(UNodeRef.DATA_ITEM_TYPE) || 'node' !== element.getAttribute(UNodeRef.DATA_ITEM_TYPE)) {
                return false;
            }
            if (this.allowedBundles) {
                var bundle = element.getAttribute(UNodeRef.DATA_ITEM_BUNDLE);
                if (bundle) {
                    return -1 !== this.allowedBundles.indexOf(bundle);
                }
            }
            return true;
        };
        Widget.prototype.removeAllItems = function () {
            for (var _i = 0, _a = this.container.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                this.container.removeChild(child);
            }
        };
        Widget.prototype.addItem = function (element) {
            var newElement = this.cloneItem(element);
            try {
                this.container.replaceChild(newElement, element);
            }
            catch (e) {
                this.container.appendChild(newElement);
            }
            this.refreshValue();
        };
        Widget.prototype.cloneItem = function (element) {
            var _this = this;
            var newElement = document.createElement('div');
            newElement.className = 'unoderef-item';
            newElement.setAttribute(UNodeRef.DATA_ITEM_TYPE, element.getAttribute(UNodeRef.DATA_ITEM_TYPE));
            newElement.setAttribute(UNodeRef.DATA_ITEM_BUNDLE, element.getAttribute(UNodeRef.DATA_ITEM_BUNDLE));
            var innerClone = element.cloneNode(true);
            innerClone.removeAttribute('class');
            newElement.appendChild(innerClone);
            var closeButton = document.createElement('span');
            closeButton.setAttribute("class", "glyphicon glyphicon-remove");
            newElement.appendChild(closeButton);
            closeButton.onclick = function () {
                if (newElement.parentElement) {
                    newElement.parentElement.removeChild(newElement);
                    _this.refreshValue();
                }
            };
            return newElement;
        };
        return Widget;
    }());
    function initializeWidget(node) {
        var sources = [];
        for (var _i = 0, _a = document.querySelectorAll(UNodeRef.SELECTOR_SOURCES); _i < _a.length; _i++) {
            var source = _a[_i];
            sources.push(source);
        }
        ;
        if (!sources.length) {
            return;
        }
        var widget = new Widget(node);
        var allContainers = sources.concat([widget.container]);
        widget.drake = dragula(allContainers, {
            copy: true,
            accepts: function (element, target) { return target === widget.container && widget.accepts(element); },
            revertOnSpill: true,
            removeOnSpill: false,
            direction: 'horizontal'
        });
        if (!widget.container.getAttribute('data-multiple')) {
            widget.drake.on('drop', function (element) {
                widget.removeAllItems();
                widget.addItem(element);
            });
        }
        else {
            widget.drake.on('drop', function (element) {
                widget.addItem(element);
            });
        }
    }
    UNodeRef.initializeWidget = initializeWidget;
})(UNodeRef || (UNodeRef = {}));
//# sourceMappingURL=/var/www/chlovet/web/sites/all/modules/composer/drupal-unoderef/dist/unoderef.js.map