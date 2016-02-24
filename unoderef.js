(function ($) {
  Drupal.behaviors.unoderef = {
    attach: function (context) {
      $(".unoderef-items", context).once().each(function () {
        var $list = $(this);
        var $hidden = $(this).siblings('input[type=hidden]');
        var allowedBundles = $list.data('allowed-bundles').split(',');

        // Handle browser refresh, if no items are displayed and hidden field is
        // not empty, search for items in page or empty hidden field.
        if (!$list.find('.unoderef-item').length && $hidden.val()) {
          // Search for items
          var found = true;
          $.each($hidden.val().split(','), function (nid) {
            $('[data-nid=' + nid + ']').clone().attr('class', '').addClass('unoderef-item').appendTo($list);
          });
          if (!found) $hidden.val('');
        }

        /**
         * Update the hidden field given the items' order
         */
        var sortItems = function sortHidden() {
          var order = [];
          $list.find('.unoderef-item').each(function () {
            order.push($(this).data('nid'))
          });
          $hidden.val(order.join(','));
        };

        $list.droppable({
          activeClass: "ui-state-default",
          accept: function($item) {
            // Prevent duplicates and wrong bundles.
            var nid = $item.data('nid');
            return !!nid && $.inArray(String(nid), $hidden.val().split(',')) == -1 && $.inArray($item.data('bundle'), allowedBundles) > -1;
          },
          drop: function (event, ui) {
            // Replace item if not multiple
            if (!$list.data('multiple')) {
              $list.children().remove()
            }
            var $newElement = $(ui.draggable).clone().attr('class', '').addClass('unoderef-item');
            $('<span class="glyphicon glyphicon-remove"></span>').appendTo($newElement);
            $newElement.appendTo(this);
            sortItems();
          }
        }).sortable({
          items: "div[data-nid]",
          sort: function () {
            $list.removeClass("ui-state-default");
          },
          update: function () {
            sortItems();
          }
        });

        $(document).on('click', '.unoderef-item > span', function(){
          $(this).parent().remove();
          sortItems();
        })
      })
    }
  };
}(jQuery));
