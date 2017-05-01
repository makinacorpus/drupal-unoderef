# Simple node-reference like module

This modules provides a simple node-reference like field, and a drag'n'drop
widget to manipulate it.

# Getting started

## Set-up

Install the module, create a field, you're good to go.

## Use with Dragula

This is the recommended version, for this to work, you need to download and
install the ``dragula`` Drupal module, which can be pulled using composer:

```sh
composer require makinacorpus/drupal-dragula
drush -y en dragula
```

This is a drag and drop based widget, in order to work, you must have draggable
elements in the page. If you are using this module as a dependency of the
[µCMS module](https://packagist.org/packages/makinacorpus/drupal-ucms) then you
have nothing to do, in all other cases, you must provide in the page a content
selector whose markup respect those rules:

 * container must carry the ``data-layout-source=1`` attribute;
 * elements must carry the ``data-item-type=node`` attribute;
 * element must carry the ``data-item-id=NID`` attribute (where NID is te node
   identifier);
 * element should carry the ``data-bundle=BUNDLE`` attribute (where BUNDLE is
   the node type).

For example:

```html
<div id="my-content-selector" data-layout-source="1">
  <div data-item-type="node" data-item-id="1" data-bundle="page">
    <h2>Page 1</h2>
    Any content, could be a view mode.
  </div>
  <div data-item-type="node" data-item-id="2" data-bundle="article">
    <h2>Article 2</h2>
    Any content, could be a view mode.
  </div>
  <!-- Etc... -->
</div>
```

There is nothing else to do, the JavaScript code will automatically find all
content sources that matches those conditions, and use it for drag and drop.

