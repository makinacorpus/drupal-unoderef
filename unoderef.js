(function ($) {
  Drupal.behaviors.unoderef = {
    attach: function (context) {
      $(".unoderef-items", context).once().each(function () {
        var $list = $(this);
        var $hidden = $(this).siblings('input[type=hidden]');

        // Handle browser refresh, if no items are displayed and hidden field is
        // not empty, search for items in page or empty hidden field.
        if (!$list.find('.unoderef-item').length && $hidden.val()) {
          // Search for items
          var found = true;
          $.each($hidden.val().split(','), function (nid) {
            $('[data-nid=' + nid + ']').clone().attr('class', '').addClass('unoderef-item').appendTo($list);
          });
          if (!found) {
            $hidden.val('');
          }
        }

        /**
         * Update the hidden field given the items' order
         */
        var sortItems = function sortHidden() {
          var order = [];
          $list.find('.unoderef-item').each(function () {
            order.push($(this).data('nid'));
          });
          $hidden.val(order.join(','));
        };

        /**
         * Return true if the item dropped is part of allowed bundles
         * @param item
         * @returns {boolean}
         */
        function canDropItem(item) {
          var $item = $(item);
          return $.inArray(String($item.data('nid')), $hidden.val().split(',')) === -1;
        }

        // Removal of an item
        $(document).on('click', '.unoderef-item > span', function () {
          $(this).parent().remove();
          sortItems();
        });

        if ($list.data('multiple')) {
          // Multiple = sortable
          var toBeRemoved = null;
          $list.sortable({
            items: "div[data-nid]",
            tolerance: "pointer",
            activate: function () {
              $list.addClass("unoderef-allow-drop");
            },
            deactivate: function () {
              $list.removeClass("unoderef-allow-drop");
            },
            over: function (event, ui) {
              $(ui.helper).addClass('unoderef-item');
            },
            update: function (event, ui) {
              sortItems();
            },
            receive: function (event, ui) {
              // Item here is the original, do not remove, see update.
              $(ui.item).removeClass('unoderef-item');
              if (!canDropItem(ui.item)) {
                $list.sortable("cancel");
                toBeRemoved = $(ui.item).data('nid');
                return false;
              }
              var elem = $(ui.item).clone().attr('class', '').addClass('unoderef-item');
              $('<span class="glyphicon glyphicon-remove"></span>').appendTo(elem);
              $(elem).appendTo($list);
            }
          });
        }
        else {
          // Single = droppable
          var allowedBundles = $list.data('allowed-bundles').split(',');
          $list.droppable({
            activeClass: "unoderef-allow-drop",
            tolerance: "pointer",
            accept: function ($item) {
              // Prevent wrong bundles.
              return $.inArray($item.data('bundle'), allowedBundles) > -1;
            },
            drop: function (event, ui) {
              // Replace item
              $list.children().remove();
              var $newElement = $(ui.draggable).clone()
                .attr('class', '')
                .addClass('unoderef-item')
                .removeAttr('style');
              $('<span class="glyphicon glyphicon-remove"></span>').appendTo($newElement);
              $newElement.appendTo(this);
              sortItems();
            }
          });
        }
      });
    }
  };
}(jQuery));
