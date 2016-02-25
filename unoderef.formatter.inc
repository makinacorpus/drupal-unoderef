<?php


/**
 * Implements hook_field_formatter_info().
 */
function unoderef_field_formatter_info() {
  return [
    'unoderef' => [
      'label'       => t('Default'),
      'field types' => ['unoderef'],
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
 * Implements hook_field_formatter_view().
 */
function unoderef_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $element = [];
  $settings = $display['settings'];
  $view_mode = isset($settings['view_mode']) ? $settings['view_mode'] : 'teaser';

  // Collect items to display
  $nids = [];
  foreach ($items as $item) {
    $nids[] = $item['nid'];
  }
  if (count($nids)) {
    $nodes = node_load_multiple($nids);
    $views = node_view_multiple($nodes, $view_mode);

    foreach ($nids as $delta => $nid) {
      $element[$delta] = $views['nodes'][$nid];
    }
  }

  return $element;
}
