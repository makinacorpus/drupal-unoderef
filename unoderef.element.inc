<?php

/**
 * Implements hook_element_info().
 */
function unoderef_element_info() {
  return [
    // Please note that this will handle only nodes dropped with data-nid
    // and data-bundle attribute, and should be used only this way.
    'unoderef' => [
      '#process'        => ['unoderef_element_process'],
      // Element will work with multiple input.
      '#multiple'       => FALSE,
      '#input'          => TRUE,
      '#value_callback' => 'unoderef_element_value',
      '#attached'       => ['library' => [['unoderef', 'unoderef']]],
    ],
  ];
}

/**
 * This callback is used to build the drop area element.
 *
 * It adds a hidden field for storing values, and prepares the container that
 * will have items rendered with the defined view mode.
 *
 * @param $element
 * @return mixed
 */
function unoderef_element_process($element) {
  $values = NULL;
  if (isset($element['#value'])) {
    $values = [];
    foreach ($element['#value'] as $item) {
      if (!empty($item['nid'])) {
        $values[] = $item['nid'];
      }
    }
  }
  $element['#theme_wrappers'] = ['form_element'];
  $element['#attributes']['class'][] = 'unoderef-widget';

  // Hidden element containing the JavaScript result, if any.
  $element['nid'] = [
    '#type'          => 'hidden',
    '#required'      => $element['#required'],
    '#attributes'    => ['rel' => 'nid'],
    '#default_value' => $values ? implode(',', $values) : $values,
  ];

  // Set the default preview value if any.
  $element['items'] = [
    '#type'       => 'container',
    '#attributes' => [
      'class'                => ['unoderef-items'],
      'data-allowed-bundles' => implode(',', $element['#allowed_bundles']),
      'data-help-text'       => t("Drag and drop media from your cart here."),
      'data-can-receive'     => 1,
    ],
  ];
  if (count($values)) {
    $nodes = node_load_multiple($values);
    // FIXME, should be set to a widget setting
    $views = node_view_multiple($nodes, $element['#view_mode']);

    foreach ($values as $index => $nid) {
      // Do not alter this markup, it is also built for javascript.
      $element['items'][$index] = [
        '#prefix' => '<div class="unoderef-item" data-nid="' . $nid . '"><span class="glyphicon glyphicon-remove"></span>',
        '#suffix' => '</div>',
        'content' => $views['nodes'][$nid],
      ];
    }
  }

  // Inform javascript through data-attibutes
  if ($element['#multiple']) {
    $element['items']['#attributes']['data-multiple'] = TRUE;
  }

  return $element;
}

/**
 * µNoderef element value callback.
 *
 * @param $element
 * @param bool $input
 * @return array
 */
function unoderef_element_value(&$element, $input = FALSE) {
  if ($input) {
    $values = explode(',', $input['nid']);
    $values = array_filter(array_unique($values));
    return array_map(function ($nid) {
      return ['nid' => $nid];
    }, $values);
  }
  return $element['#default_value'];
}


/**
 * Implements hook_field_validate().
 */
function unoderef_field_validate($entity_type, $entity, $field, $instance, $langcode, $items, &$errors) {
  if (!count($items)) {
    return;
  }

  // Collect nodes.
  $nids = [];
  foreach ($items as $item) {
    if (!empty($item['nid'])) {
      $nids[] = $item['nid'];
    }
  }
  $nodes = node_load_multiple($nids);

  // Verify node exist.
  if (count($nodes) != count($nids)) {
    $errors[$field['field_name']][$langcode][] = [
      'error'   => 'unoderef_non_existent_nodes',
      'message' => t('There is content no longer available.'),
    ];
  }

  // Verify bundles are correct.
  foreach ($nodes as $node) {
    if (!in_array($node->type, $instance['widget']['settings']['bundles'])) {
      $errors[$field['field_name']][$langcode][] = [
        'error'   => 'unoderef_wrong_bundle',
        'message' => t("%name: this node's type is not allowed here.", [
          '%name' => entity_label('node', $node),
        ]),
      ];
    }
  }
}


/**
 * Implements hook_field_is_empty().
 */
function unoderef_field_is_empty($item) {
  return empty($item['nid']);
}
