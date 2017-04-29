(function ($, Drupal, document, dragula) {
  "use strict";

  /**
   * Fix item markup when dropped
   *
   * @param DOMElement element
   *   The element being dropped
   *
   * @return DOMElement
   *   The new element
   */
  function createDropChild(element) {
    var newElement = document.createElement('div');
    newElement.className = 'unoderef-item';

    newElement.setAttribute('data-item-type', element.getAttribute('data-item-type'));
    newElement.setAttribute('data-item-id', element.getAttribute('data-item-id'));

    var innerClone = element.cloneNode(true);
    innerClone.className = '';
    newElement.appendChild(innerClone);
    newElement.innerHTML += '<span class="glyphicon glyphicon-remove"></span>';

    return newElement;
  }

  /**
   * Replaces the list element with the correct representation
   *
   * @param DOMElement element
   *   The element being dropped
   */
  function replaceElementInContainer(element) {
    element.parentNode.replaceChild(createDropChild(element), element);
  }

  Drupal.behaviors.unoderefDragula = {
    attach: function (context, settings) {

      $(context)
        .find(".unoderef-items")
        .once()
        .each(function () {

          var listContainer = this;
          var $list = $(listContainer);
          var hidden = $list.siblings('input[type=hidden]').get(0);
          var allowedBundles = listContainer.getAttribute('data-allowed-bundles').split(',');

          // Redraw the items
          for (var i = 0; i < listContainer.childNodes.length; i++) {
            replaceElementInContainer(listContainer.childNodes[i]);
          }

          // FIXME re-implement this properly
          // Handle browser refresh, if no items are displayed and hidden field is
          // not empty, search for items in page or empty hidden field.
//          if (!$list.find('.unoderef-item').length && hidden.getAttribute('value')) {
//            // Search for items
//            var found = true;
//            $.each(hidden.getAttribute('value').split(','), function (nid) {
//              $('[data-item-id=' + nid + ']').clone().attr('class', '').addClass('unoderef-item').appendTo($list);
//            });
//            if (!found) {
//              hidden.setAttribute('value', "");
//            }
//          }

          /**
           * Update the hidden field given the items' order
           */
          var sortItems = function () {
            var order = [];
            var nodes = listContainer.childNodes;
            for (var i = 0; i < nodes.length; i++) {
              var id = nodes[i].getAttribute('data-item-id');
              if (id) {
                order.push(id);
              } else {
                listContainer.removeChild(nodes[i]);
              }
            }
            hidden.setAttribute('value', order.join(','));
          };

          /**
           * Return true if the item dropped is part of allowed bundles
           *
           * @param DOMElement element
           *   The element being dropped
           *
           * @returns boolean
           */
          function canDropItem(element) {
            if (!element.hasAttribute('data-item-id') || !element.hasAttribute('data-item-type')) {
              return false;
            }
            if ('node' !== element.getAttribute('data-item-type')) {
              return false;
            }
            var bundle = element.getAttribute('data-bundle');
            if (bundle) {
              if (-1 === allowedBundles.indexOf(bundle)) {
                return false;
              }
            }
            return true;
          }

          // Removal of an item
          $(document).on('mousedown', '.unoderef-item > span', function () {
            $(this).parent().remove();
            sortItems();
          });

          // Find all potential sources in document, in order to make it
          // easier for everybody, we re-use the phplayout and ucms sources
          // so it'll work globally transparently.
          var sources = [];
          $(document).find('[data-layout-source=1]').each(function () {
            sources.push(this);
          });

          // No sources mean that the widgets cannot work.
          if (!sources.length) {
            return;
          }

          var allContainers = sources.concat([listContainer]);

          var drake = dragula(allContainers, {
            // Sources are readonly for us, we just can copy.
            copy: function (element, source) {
              return true;
            },
            // Access only items whose type is 'node'
            accepts: function (element, target) {
              return target === listContainer && canDropItem(element);
            },
            // Only the item carrying the type is valid
            invalid: function (element, handle) {
              return !$(element).closest('[data-item-type]').length;
            },
            revertOnSpill: true,
            removeOnSpill: false,
            direction: 'horizontal'
          });

          // Multiple widgets
          if (listContainer.getAttribute('data-multiple')) {

            // Handles drop
            drake.on('drop', function (element, target, source, sibling) {
              // Redraw element and refresh hidden value
              replaceElementInContainer(element);
              sortItems();
            });

          } else {

            // Handles drop
            drake.on('drop', function (element, target, source, sibling) {
              // Remove all others
              var nodes = target.childNodes;
              for (var i = 0; i < nodes.length; i++) {
                if (element !== nodes[i]) {
                  target.removeChild(nodes[i]);
                }
              }
              // Redraw element and refresh hidden value
              replaceElementInContainer(element);
              sortItems();
            });
          }
        })
      ;
    }
  };
}(jQuery, Drupal, document, dragula));
