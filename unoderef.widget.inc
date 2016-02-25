<?php


/**
 * Implements hook_field_widget_info().
 */
function unoderef_field_widget_info() {
  return [
    'unoderef' => [
      'label'       => t('Node Reference drop area'),
      'field types' => ['unoderef'],
      'settings'    => ['bundles' => [], 'view_mode' => ''],
      'behaviors'   => [
        'multiple values' => FIELD_BEHAVIOR_CUSTOM,
        'default value'   => FIELD_BEHAVIOR_DEFAULT,
      ],
    ],
  ];
}

/**
 * Implements hook_field_widget_settings_form().
 */
function unoderef_field_widget_settings_form($field, $instance) {
  $widget = $instance['widget'];
  $settings = $widget['settings'];

  // Bundle linked to this field.
  $bundles = field_info_bundles('node');
  foreach ($bundles as &$bundle) {
    $bundle = $bundle['label'];
  }
  $form['bundles'] = [
    '#type'          => 'select',
    '#title'         => t('Allowed bundles'),
    '#default_value' => $settings['bundles'],
    '#options'       => $bundles,
    '#required'      => TRUE,
    '#multiple'      => TRUE,
  ];

  $form['view_mode'] = [
    '#type'          => 'select',
    '#title'         => t('View mode for items'),
    '#default_value' => $settings['view_mode'],
    '#options'       => _unodered_view_mode_options(),
    '#required'      => TRUE,
  ];

  return $form;
}

/**
 * View mode to render this field.
 *
 * @return array
 */
function _unodered_view_mode_options() {
  $view_modes = [];
  $entity_info = entity_get_info('node');
  foreach ($entity_info['view modes'] as $view_mode => $view_mode_info) {
    $view_modes[$view_mode] = $view_mode_info['label'];
  }
  return $view_modes;
}

/**
 * Implements hook_field_widget_form().
 */
function unoderef_field_widget_form(&$form, &$form_state, $field, $instance, $langcode, $items, $delta, $element) {
  $multiple = $field['cardinality'] > 1 || $field['cardinality'] == FIELD_CARDINALITY_UNLIMITED;

  $element += [
    '#type'            => $instance['widget']['type'],
    '#multiple'        => $multiple,
    '#default_value'   => $items,
    '#view_mode'       => $instance['widget']['settings']['view_mode'],
    '#allowed_bundles' => $instance['widget']['settings']['bundles'],
  ];
  return $element;
}
