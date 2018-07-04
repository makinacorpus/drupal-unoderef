<?php


/**
 * Implements hook_field_formatter_info().
 */
function unoderef_field_formatter_info() {
  return [
    'unoderef' => [
      'label'       => t('Default'),
      'field types' => ['unoderef'],
      'settings'    => [
        // Next two options defaults should be true instead, but we need to keep
        // it to false for backward compatibility until next major release.
        'access_check'    => false,
        'published_only'  => false,
        'view_mode'       => 'teaser',
      ],
    ],
    'unoderef_first' => [
      'label'       => t('Default'),
      'field types' => ['unoderef'],
      'settings'    => [
        // Next two options defaults should be true instead, but we need to keep
        // it to false for backward compatibility until next major release.
        'access_check'    => false,
        'published_only'  => false,
        'view_mode'       => 'teaser',
      ],
    ],
  ];
}

/**
 * Implements hook_field_formatter_settings_form().
 */
function unoderef_field_formatter_settings_form($field, $instance, $view_mode, $form, &$form_state) {
  $display = $instance['display'][$view_mode];
  $settings = $display['settings'];

  $element = [];
  $element['access_check'] = [
    '#title'         => t('Use node access'),
    '#type'          => 'checkbox',
    '#default_value' => $settings['access_check'],
  ];
  $element['published_only'] = [
    '#title'         => t('Only published content (extra access check)'),
    '#type'          => 'checkbox',
    '#default_value' => $settings['published_only'],
  ];
  $element['view_mode'] = [
    '#title'         => t('View mode'),
    '#type'          => 'select',
    '#default_value' => $settings['view_mode'],
    '#required'      => TRUE,
    '#options'       => _unodered_view_mode_options(),
  ];

  return $element;
}

/**
 * Implements hook_field_formatter_settings_summary().
 */
function unoderef_field_formatter_settings_summary($field, $instance, $view_mode) {
  $display = $instance['display'][$view_mode];
  $settings = $display['settings'];

  $view_modes = _unodered_view_mode_options();
  return t('View mode: @view_mode', ['@view_mode' => $view_modes[$settings['view_mode']]]);
}

/**
 * Load and filter nodes from the given field item, using the given formatter
 * settings (settings from 'unoderef' or 'unoderef_first' formatters).
 *
 * @param \stdClass[] $item
 * @param array $settings
 *
 * @return \stdClass[]
 */
function unoderef_field_formatter_view_filter_nodes(array $nodes, array $settings = []) {

  $access_check = $settings['access_check'] ?? false;
  $published_only = $settings['published_only'] ?? false;

  // Filter result accordingly to formatter configuration
  if ($published_only || $access_check) {
    foreach ($nodes as $index => $node) {
      if (
        ($published_only && !$node->status) || // Node is published
        ($access_check && !node_access('view', $node)) // User can see the node in current context
      ){
        unset($nodes[$index]);
      }
    }
  }

  return array_filter($nodes);
}

/**
 * Implements hook_field_formatter_view().
 */
function unoderef_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $element = [];
  $settings = $display['settings'];
  $view_mode = $settings['view_mode'] ?? 'teaser';
  $first_only = 'unoderef_first' === $display['type'];

  // Collect items to display
  $nids = [];
  foreach ($items as $item) {
    $nids[] = $item['nid'];
  }
  if (!$nids) {
    return $element;
  }

  // Process after filtering
  if ($nodes = unoderef_field_formatter_view_filter_nodes(node_load_multiple($nids), $settings)) {
    if ($first_only) { // unoderef_first
      $first = array_shift($nodes);
      $element[0] = node_view($first, $view_mode);
    } else { // unoderef
      $delta = -1;
      foreach (node_view_multiple($nodes, $view_mode)['nodes'] as $view) {
        if (is_array($view)) {
          $element[$delta++] = $view;
        }
      }
    }
  }

  return $element;
}
