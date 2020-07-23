/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an item in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IToolboxItem');
// TODO: Do we even need this?
goog.provide('Blockly.ISelectableToolboxItem');
goog.provide('Blockly.ICollapsibleToolboxItem');

/**
 * Interface for an item in the toolbox.
 * @extends {Blockly.IToolboxItem}
 * @interface
 */
Blockly.IToolboxItem = function() {};

/**
 * Create the dom for the toolbox item.
 * @return {void}
 */
Blockly.IToolboxItem.prototype.createDom;

/**
 * The name of the toolbox item.
 * Used for events.
 */
Blockly.IToolboxItem.prototype.getDiv;

/**
 * Returns a unique identifier for the toolbox item.
 * @return {string}
 */
Blockly.IToolboxItem.prototype.getId;

/**
 * Create the dom for the toolbox item.
 * @return {void}
 */
Blockly.IToolboxItem.prototype.isSelectable;

/**
 * Whether the toolbox item is collapsible.
 * @return {boolean} True if the toolbox item is collapsible.
 */
Blockly.IToolboxItem.prototype.isCollapsible;

/**
 * Dispose of this toolbox item. No-op by default.
 * @public
 */
Blockly.IToolboxItem.prototype.dispose;

/**
 * Interface for an item in the toolbox that can be selected.
 * @extends {Blockly.IToolboxItem}
 * @interface
 */
Blockly.ISelectableToolboxItem = function() {};

/**
 * Gets the name of the toolbox item. Used for emitting events.
 * @return {string} The name of the toolbox item.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.getName;

/**
 * Set the current toolbox item as selected. No-op by default.
 * @param {boolean} isSelected True if this category is selected, false otherwise.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.setSelected;

/**
 * Event listener for when the toolbox item is clicked.
 * @param {Event} e Click event to handle.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.onClick;

/**
 * Gets the contents of the toolbox item. These are items that are meant to be
 * displayed in the flyout.
 * @return {!Array.<Blockly.utils.toolbox.FlyoutItemDef>} The definition of items
 *     to be displayed in the flyout.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.getContents;

/**
 * Interface for an item in the toolbox that can be collapsed.
 * @extends {Blockly.SelectableToolboxItem}
 * @interface
 */
Blockly.ICollapsibleToolboxItem = function() {};

/**
 * Whether the toolbox item is expanded to show it's child subcategories.
 * @return {boolean} True if the toolbox item shows it's children, false if it is
 *     collapsed.
 * @public
 */
Blockly.ICollapsibleToolboxItem.prototype.isExpanded;

/**
 * Toggle if this toolbox item is expanded.
 */
Blockly.ICollapsibleToolboxItem.prototype.toggleExpanded;

/**
 * Gets the contents to display in the flyout or the nested toolbox items.
 * @return {!Array.<Blockly.utils.toolbox.FlyoutItemDef>|!Array.<Blockly.ToolboxItem>}
 *    The definition of items to be displayed in the flyout or the nested
 *    children of the collapsed category.
 * @public
 */
Blockly.ICollapsibleToolboxItem.prototype.getContents;
