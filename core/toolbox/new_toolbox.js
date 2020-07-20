/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox from whence to create blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.NewToolbox');

goog.require('Blockly.ToolboxCategory');
goog.require('Blockly.ToolboxSeparator');

/**
 * TODO: category -> toolbox item
 * TODO: Decide whether we want to use IToolboxItem or toolboxItem && Same with selectable
 * TODO: Go through TODOs
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 * @implements {Blockly.IBlocklyActionable}
 * @implements {Blockly.IDeleteArea}
 * @implements {Blockly.IStyleable}
 * @implements {Blockly.IToolbox}
 */
Blockly.NewToolbox = function(workspace) {
  /**
   * The workspace this toolbox is on.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;

  /**
   * The JSON describing the contents of this toolbox.
   * @type {Blockly.utils.toolbox.Toolbox[]}
   * @protected
   */
  this.toolboxDef_ = workspace.options.languageTree;

  /**
   * Whether the toolbox should be laid out horizontally.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspace.options.horizontalLayout;

  /**
   * The html container for the toolbox.
   * TODO: Do we consider this to be a public API from toolbox?
   * @type {HTMLDivElement}
   */
  this.HtmlDiv = null;

  /**
   * The html container for the contents of a toolbox.
   * @type {HTMLDivElement}
   * @protected
   */
  this.contentsDiv_ = null;

  /**
   * The list of items in the toolbox.
   * @type {Array.<Blockly.ToolboxItem>}
   * @protected
   */
  this.contents_ = [];

  /**
   * The width of the toolbox.
   * @type {number}
   * @protected
   */
  this.width_ = 0;

  /**
   * The height of the toolbox.
   * @type {number}
   * @protected
   */
  this.height_ = 0;

  /**
   * Is RTL vs LTR.
   * TODO: Do we consider this to be a public API from toolbox?
   * @type {boolean}
   */
  this.RTL = workspace.options.RTL;

  /**
   * The flyout for the toolbox.
   * @type {Blockly.Flyout}
   * @private
   */
  this.flyout_ = null;

  /**
   * The id of the toolbox item as the key and the toolbox item as the value.
   * @type {Object<string, Blockly.ToolboxItem>}
   * @protected
   */
  this.contentIds_ = {};

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * TODO: Do we consider this to be a public API from toolbox?
   * @type {number}
   */
  this.toolboxPosition = workspace.options.toolboxPosition;

  /**
   * The currently selected item.
   * @type {Blockly.ToolboxItem}
   * @protected
   */
  this.selectedItem_ = null;

  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   * @type {!Array.<Array<?>>}
   * @private
   */
  this.boundEvents_ = [];
};

/**
 * Initializes the toolbox
 * @package
 */
Blockly.NewToolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = workspace.getParentSvg();

  this.flyout_ = this.createFlyout_();

  this.createDom_(this.workspace_);
  this.render(this.toolboxDef_);
  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.HtmlDiv, 'toolboxBackgroundColour',
      'background-color');
  themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');

  // Insert the flyout after the workspace.
  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'), svg);
  this.flyout_.init(workspace);
};

/**
 * Creates the dom for the toolbox.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace this toolbox is on.
 * @protected
 */
Blockly.NewToolbox.prototype.createDom_ = function(workspace) {
  var svg = workspace.getParentSvg();

  this.HtmlDiv = this.createContainer_(workspace);

  this.contentsDiv_ = this.createContentsContainer_();
  this.contentsDiv_.tabIndex = 0;
  Blockly.utils.aria.setRole(this.contentsDiv_, Blockly.utils.aria.Role.TREE);
  this.HtmlDiv.appendChild(this.contentsDiv_);

  svg.parentNode.insertBefore(this.HtmlDiv, svg);

  this.addToolboxListeners_();
};

/**
 * Creates the container div for the toolbox.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace that the toolbox is on.
 * @return {!HTMLDivElement} The html container for the toolbox.
 * @protected
 */
Blockly.NewToolbox.prototype.createContainer_ = function(workspace) {
  var toolboxContainer = document.createElement('div');
  Blockly.utils.dom.addClass(toolboxContainer, 'blocklyToolboxDiv');
  Blockly.utils.dom.addClass(toolboxContainer, 'blocklyNonSelectable');
  toolboxContainer.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  return toolboxContainer;
};

/**
 * Creates the container for all the contents in the toolbox.
 * @return {!HTMLDivElement} The html container for the toolbox contents.
 * @protected
 */
Blockly.NewToolbox.prototype.createContentsContainer_ = function() {
  var contentsContainer = document.createElement('div');
  // TODO: Should I be using addClass?
  Blockly.utils.dom.addClass(contentsContainer, 'blocklyToolboxContents');
  if (this.isHorizontal()) {
    contentsContainer.style.flexDirection = 'row';
  }
  return contentsContainer;
};

/**
 * Adds event listeners to the toolbox HtmlDiv.
 * @protected
 */
Blockly.NewToolbox.prototype.addToolboxListeners_ = function() {
  // Clicking on toolbox closes popups.
  var clickEvent = Blockly.bindEventWithChecks_(this.HtmlDiv, 'mousedown', this,
      this.onClick_, /* opt_noCaptureIdentifier */ false,
      /* opt_noPreventDefault */ true);
  this.boundEvents_.push(clickEvent);

  var keyDownEvent = Blockly.bindEventWithChecks_(this.contentsDiv_, 'keydown',
      this, this.onKeyDown_, /* opt_noCaptureIdentifier */ false,
      /* opt_noPreventDefault */ true);
  this.boundEvents_.push(keyDownEvent);
};

/**
 * Handles on click events for when the toolbox or toolbox items are clicked.
 * @param {Event} e Click event to handle.
 * @protected
 */
Blockly.NewToolbox.prototype.onClick_ = function(e) {
  if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
    // Close flyout.
    Blockly.hideChaff(false);
  } else {
    var srcElement = e.srcElement;
    var itemId = srcElement.getAttribute('id');
    if (itemId) {
      var item = this.getToolboxItemById(itemId);
      if (item.isSelectable()) {
        this.setSelectedItem(item);
        item.onClick();
      }
    }
    // Just close popups.
    Blockly.hideChaff(true);
  }
  Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
};

/**
 * Handles key down events for the toolbox.
 * @param {KeyboardEvent} e The key down event.
 * @protected
 */
Blockly.NewToolbox.prototype.onKeyDown_ = function(e) {
  var handled = false;
  switch (e.keyCode) {
    case Blockly.utils.KeyCodes.DOWN:
      handled = this.selectNext();
      break;
    case Blockly.utils.KeyCodes.UP:
      handled = this.selectPrevious();
      break;
    case Blockly.utils.KeyCodes.LEFT:
      handled = this.selectParent();
      break;
    case Blockly.utils.KeyCodes.RIGHT:
      handled = this.selectChild();
      break;
    case Blockly.utils.KeyCodes.ENTER:
    case Blockly.utils.KeyCodes.SPACE:
      if (this.selectedItem_ && this.selectedItem_.isCollapsible()) {
        this.selectedItem_.toggleExpanded();
        handled = true;
      }
      break;
    default:
      handled = false;
      break;
  }

  if (handled) {
    e.preventDefault();
  }
};

/**
 * Creates the flyout based on the toolbox layout.
 * @return {Blockly.Flyout} The flyout for the toolbox.
 * @throws {Error} If missing a require for both `Blockly.HorizontalFlyout` and
 *     `Blockly.VerticalFlyout`.
 * @protected
 */
Blockly.NewToolbox.prototype.createFlyout_ = function() {
  var workspace = this.workspace_;
  var flyout = null;
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': workspace,
        'rtl': workspace.RTL,
        'oneBasedIndex': workspace.options.oneBasedIndex,
        'horizontalLayout': workspace.horizontalLayout,
        'renderer': workspace.options.renderer,
        'rendererOverrides': workspace.options.rendererOverrides
      }));
  workspaceOptions.toolboxPosition = workspace.options.toolboxPosition;

  if (workspace.horizontalLayout) {
    if (!Blockly.HorizontalFlyout) {
      throw Error('Missing require for Blockly.HorizontalFlyout');
    }
    flyout = new Blockly.HorizontalFlyout(workspaceOptions);
  } else {
    if (!Blockly.VerticalFlyout) {
      throw Error('Missing require for Blockly.VerticalFlyout');
    }
    flyout = new Blockly.VerticalFlyout(workspaceOptions);
  }
  if (!flyout) {
    throw Error('One of Blockly.VerticalFlyout or Blockly.Horizontal must be' +
        'required.');
  }
  return flyout;
};

/**
 * Render the toolbox with all of the toolbox items. This should only be used
 * for re rendering the entire toolbox. For adding single items use
 * insertToolboxItem.
 * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding objects
 *    containing information on the contents of the toolbox.
 *    @protected
 */
Blockly.NewToolbox.prototype.addContents_ = function(toolboxDef) {
  for (var i = 0, childIn; (childIn = toolboxDef[i]); i++) {
    // TODO: Add classes to registry so we can avoid this switch statement.
    switch (childIn['kind'].toUpperCase()) {
      case 'CATEGORY':
        var category = new Blockly.ToolboxCategory(childIn, this);
        this.insertToolboxItem(category);
        break;
      case 'SEP':
        var separator = new Blockly.ToolboxSeparator(childIn, this);
        this.insertToolboxItem(separator);
        break;
      default:
        // TODO: Handle someone adding a custom component.
    }
  }
};

/**
 * Updates all the contents of the toolbox.
 * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding
 *     objects containing information on the contents of the toolbox.
 * @package
 */
Blockly.NewToolbox.prototype.render = function(toolboxDef) {
  this.toolboxDef_ = toolboxDef;
  // TODO: Future improvement to compare the new toolboxDef with the old and
  //  only re render what has changed.
  for (var i = 0; i < this.contents_.length; i++) {
    var child = this.contents_[i];
    // TODO: getDiv() on IToolboxItem
    child.getDiv().remove();
  }
  this.contents_ = [];
  this.contentIds_ = {};
  this.addContents_(toolboxDef);
  this.position();
};

/**
 * Add an item to the end of the toolbox.
 * TODO: Add ability to insert at a position
 * @param {!Blockly.ToolboxItem} toolboxItem The item in the toolbox.
 */
Blockly.NewToolbox.prototype.insertToolboxItem = function(toolboxItem) {
  this.contents_.push(toolboxItem);
  this.contentIds_[toolboxItem.getId()] = toolboxItem;
  if (toolboxItem.isCollapsible()) {
    for (var i = 0; i < toolboxItem.contents_.length; i++) {
      var child = toolboxItem.contents_[i];
      this.contents_.push(child);
      this.contentIds_[child.getId()] = child;
    }
  }
  this.contentsDiv_.appendChild(toolboxItem.createDom());
};

/**
 * Return the deletion rectangle for this toolbox.
 * @return {Blockly.utils.Rect} Rectangle in which to delete.
 */
Blockly.NewToolbox.prototype.getClientRect = function() {
  if (!this.HtmlDiv) {
    return null;
  }

  // BIG_NUM is offscreen padding so that blocks dragged beyond the toolbox
  // area are still deleted.  Must be smaller than Infinity, but larger than
  // the largest screen size.
  var BIG_NUM = 10000000;
  var toolboxRect = this.HtmlDiv.getBoundingClientRect();

  var top = toolboxRect.top;
  var bottom = top + toolboxRect.height;
  var left = toolboxRect.left;
  var right = left + toolboxRect.width;

  // Assumes that the toolbox is on the SVG edge.  If this changes
  // (e.g. toolboxes in mutators) then this code will need to be more complex.
  if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    return new Blockly.utils.Rect(-BIG_NUM, bottom, -BIG_NUM, BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    return new Blockly.utils.Rect(top, BIG_NUM, -BIG_NUM, BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, -BIG_NUM, right);
  } else {  // Right
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, left, BIG_NUM);
  }
};

/**
 * Gets the toolbox item with the given id.
 * @param {string} id The id of the toolbox item.
 * @return {Blockly.ToolboxItem} The toolbox item with the given id, or null if
 *     no item exists.
 */
Blockly.NewToolbox.prototype.getToolboxItemById = function(id) {
  return this.contentIds_[id];
};

/**
 * Get the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.NewToolbox.prototype.getWidth = function() {
  return this.width_;
};

/**
 * Get the height of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.NewToolbox.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Get the toolbox flyout.
 * @return {Blockly.Flyout} The toolbox flyout.
 */
Blockly.NewToolbox.prototype.getFlyout = function() {
  return this.flyout_;
};

/**
 * Gets the workspace for the toolbox.
 * @return {!Blockly.WorkspaceSvg} The parent workspace for the toolbox.
 */
Blockly.NewToolbox.prototype.getWorkspace = function() {
  return this.workspace_;
};

/**
 * Get whether or not the toolbox is horizontal.
 * @return {boolean} True if the toolbox is horizontal, false if the toolbox is
 *     vertical.
 */
Blockly.NewToolbox.prototype.isHorizontal = function() {
  return this.horizontalLayout_;
};

/**
 * Position the toolbox based on whether it is a horizontal toolbox and whether
 * the workspace is in rtl.
 */
Blockly.NewToolbox.prototype.position = function() {
  var toolboxDiv = this.HtmlDiv;
  if (!toolboxDiv) {
    // Not initialized yet.
    return;
  }

  if (this.horizontalLayout_) {
    toolboxDiv.style.left = '0';
    toolboxDiv.style.height = 'auto';
    toolboxDiv.style.width = '100%';
    this.height_ = toolboxDiv.offsetHeight;
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {  // Top
      toolboxDiv.style.top = '0';
    } else {  // Bottom
      toolboxDiv.style.bottom = '0';
    }
  } else {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {  // Right
      toolboxDiv.style.right = '0';
    } else {  // Left
      toolboxDiv.style.left = '0';
    }
    toolboxDiv.style.height = '100%';
    this.width_ = toolboxDiv.offsetWidth;
  }
  this.flyout_.position();
};

/**
 * Unhighlight any previously specified option.
 */
Blockly.NewToolbox.prototype.clearSelection = function() {
  this.setSelectedItem(null);
};

/**
 * Updates the category colours and background colour of selected categories.
 * @package
 */
Blockly.NewToolbox.prototype.refreshTheme = function() {
  for (var i = 0; i < this.contents_.length; i++) {
    var child = this.contents_[i];
    if (child.refreshTheme) {
      child.refreshTheme();
    }
  }
};

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 */
Blockly.NewToolbox.prototype.refreshSelection = function() {
  // TODO: Need to use .contents_
  if (this.selectedItem_ && !this.selectedItem_.isCollapsible() &&
      this.selectedItem_.contents_) {
    this.flyout_.show(this.selectedItem_.contents_);
  }
};

/**
 * Toggles the visibility of the toolbox.
 * @param {boolean} isVisible True if toolbox should be visible.
 */
Blockly.NewToolbox.prototype.setVisible = function(isVisible) {
  this.HtmlDiv.style.display = isVisible ? 'block' : 'none';
};

/**
 * Set the given item as selected.
 * @param {Blockly.SelectableToolboxItem} newItem The toolbox item to select.
 */
Blockly.NewToolbox.prototype.setSelectedItem = function(newItem) {
  var oldItem = this.selectedItem_;

  if ((!newItem && !oldItem)) {
    return;
  }
  newItem = /** @type {Blockly.SelectableToolboxItem} */ (newItem);
  // Do not deselect if the oldItem has children and has been previously clicked on.
  if (oldItem && (!oldItem.isCollapsible() || oldItem != newItem)) {
    this.selectedItem_ = null;
    oldItem.setSelected(false);
    Blockly.utils.aria.setState(this.contentsDiv_,
        Blockly.utils.aria.State.ACTIVEDESCENDANT, '');
  }

  if (newItem && newItem != oldItem ) {
    this.selectedItem_ = newItem;
    newItem.setSelected(true);
    Blockly.utils.aria.setState(this.contentsDiv_,
        Blockly.utils.aria.State.ACTIVEDESCENDANT, newItem.getId());
  }

  this.updateFlyout_(oldItem, newItem);
  this.fireEvent_(oldItem, newItem);
};

/**
 * Selects the toolbox item by the position.
 * @param {number} position The position of the item to select.
 * @public
 */
Blockly.NewToolbox.prototype.selectItemByPosition = function(position) {
  if (position > -1 && position < this.contents_.length) {
    var item = this.contents_[position];
    if (item.isSelectable()) {
      this.setSelectedItem(item);
    }
  }
};

/**
 * Updates the flyout.
 * @param {Blockly.ToolboxItem} oldItem The previously selected toolbox item.
 * @param {Blockly.ToolboxItem} newItem The currently selected toolbox item.
 * @private
 */
Blockly.NewToolbox.prototype.updateFlyout_ = function(oldItem, newItem) {
  if (oldItem == newItem || !newItem || !newItem.contents_ ||
      newItem.isCollapsible()) {
    this.flyout_.hide();
  } else if (newItem.contents_) {
    this.flyout_.show(newItem.contents_);
    this.flyout_.scrollToStart();
  }
};

/**
 * Emits an event when a new toolbox item is selected.
 * @param {Blockly.SelectableToolboxItem} oldItem The previously selected toolbox item.
 * @param {Blockly.SelectableToolboxItem} newItem The currently selected toolbox item.
 * @private
 */
Blockly.NewToolbox.prototype.fireEvent_ = function(oldItem, newItem) {
  var oldElement = oldItem && oldItem.getName();
  var newElement = newItem && newItem.getName();
  // In this case the toolbox closes, so the newElement should be null.
  if (oldItem == newItem) {
    newElement = null;
  }
  // TODO: Should this change from category since we can have toolbox items?
  var event = new Blockly.Events.Ui(null, 'category',
      oldElement, newElement);
  event.workspaceId = this.workspace_.id;
  Blockly.Events.fire(event);
};

/**
 * Handles the given Blockly action on a toolbox.
 * This is only triggered when keyboard accessibility mode is enabled.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the field handled the action, false otherwise.
 * @package
 */
Blockly.NewToolbox.prototype.onBlocklyAction = function(action) {
  var selected = this.selectedItem_;
  if (!selected) {
    return false;
  }
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      return this.selectPrevious();
    case Blockly.navigation.actionNames.OUT:
      return this.selectParent();
    case Blockly.navigation.actionNames.NEXT:
      return this.selectNext();
    case Blockly.navigation.actionNames.IN:
      return this.selectChild();
    default:
      return false;
  }
};

/**
 * Selects the parent if it exists, or closes the current item.
 * @return {boolean} True if a parent category was selected, false otherwise.
 * @public
 */
Blockly.NewToolbox.prototype.selectParent = function() {
  if (!this.selectedItem_) {
    return false;
  }

  if (this.selectedItem_.isCollapsible()) {
    this.selectedItem_.setExpanded(false);
    return true;
  } else if (this.selectedItem_.getParent() &&
      this.selectedItem_.isSelectable()) {
    this.setSelectedItem(this.selectedItem_.getParent());
    return true;
  }
  return false;
};

/**
 * Selects the previous visible toolbox item.
 * @return {boolean} True if a child category was selected, false otherwise.
 * @public
 */
Blockly.NewToolbox.prototype.selectChild = function() {
  if (!this.selectedItem_ || !this.selectedItem_.isCollapsible()) {
    return false;
  }
  var collapsibleItem = /** @type {Blockly.CollapsibleToolboxItem} */
      (this.selectedItem_);
  if (!collapsibleItem.isExpanded()) {
    collapsibleItem.setExpanded(true);
    return true;
  } else {
    this.selectNext();
    return true;
  }
  return false;
};

/**
 * Selects the next visible toolbox item.
 * @return {boolean} True if a next category was selected, false otherwise.
 * @public
 */
Blockly.NewToolbox.prototype.selectNext = function() {
  if (!this.selectedItem_) {
    return false;
  }

  var nextItemIdx = this.contents_.indexOf(this.selectedItem_) + 1;
  if (nextItemIdx > -1 && nextItemIdx < this.contents_.length) {
    var nextItem = this.contents_[nextItemIdx];
    while (nextItem && !nextItem.isSelectable()) {
      nextItem = this.contents_[++nextItemIdx];
    }
    if (nextItem && nextItem.isSelectable()) {
      this.setSelectedItem(nextItem);
      return true;
    }
  }
  return false;
};

/**
 * Selects the previous visible toolbox item.
 * @return {boolean} True if a previous category was selected, false otherwise.
 * @public
 */
Blockly.NewToolbox.prototype.selectPrevious = function() {
  if (!this.selectedItem_) {
    return false;
  }

  var prevItemIdx = this.contents_.indexOf(this.selectedItem_) - 1;
  if (prevItemIdx > -1 && prevItemIdx < this.contents_.length) {
    var prevItem = this.contents_[prevItemIdx];
    while (prevItem && !prevItem.isSelectable()) {
      prevItem = this.contents_[--prevItemIdx];
    }
    if (prevItem && prevItem.isSelectable()) {
      this.setSelectedItem(prevItem);
      return true;
    }
  }
  return false;
};

/**
 * Gets the selected item.
 * @return {Blockly.ToolboxItem} The selected item, or null if no item is
 *     currently selected.
 */
Blockly.NewToolbox.prototype.getSelected = function() {
  return this.selectedItem_;
};

/**
 * Disposes of this toolbox.
 */
Blockly.NewToolbox.prototype.dispose = function() {
  this.flyout_.dispose();
  for (var i = 0; i < this.contents_.length; i++) {
    var toolboxItem = this.contents_[i];
    toolboxItem.dispose();
  }

  for (var j = 0; j < this.boundEvents_.length; j++) {
    Blockly.unbindEvent_(this.boundEvents_[j]);
  }
  this.boundEvents_ = [];

  this.workspace_.getThemeManager().unsubscribe(this.HtmlDiv);
  Blockly.utils.dom.removeNode(this.HtmlDiv);
};

/**
 * CSS for Toolbox.  See css.js for use.
 * TODO: add -moz- to flex-direction.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyToolboxDelete {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyToolboxGrab {',
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',

  /* Category tree in Toolbox. */
  '.blocklyToolboxDiv {',
    'background-color: #ddd;',
    'overflow-x: visible;',
    'overflow-y: auto;',
    'position: absolute;',
    'z-index: 70;', /* so blocks go under toolbox when dragging */
    '-webkit-tap-highlight-color: transparent;', /* issue #1345 */
  '}',

  '.blocklyToolboxDiv:focus {',
    'outline: none;',
  '}',

  '.blocklyToolboxCategory {',
    'padding-bottom: 3px',
  '}',

  '.blocklyToolboxContents {',
    'display: flex;',
    'flex-wrap: wrap;',
    'flex-direction: column;',
  '}',

  '.blocklyTreeRoot {',
    'padding: 4px 0;',
  '}',

  '.blocklyTreeRow {',
    'height: 22px;',
    'line-height: 22px;',
    'padding-right: 8px;',
    'white-space: nowrap;',
    'pointer-events: none',
  '}',

  '.blocklyHorizontalTree {',
    'margin: 1px 5px 8px 0;',
  '}',

  '.blocklyHorizontalTreeRtl {',
    'margin: 1px 0 8px 5px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
    'margin-left: 8px;',
    'padding-right: 0px',
  '}',

  '.blocklyTreeRow:not(.blocklyTreeSelected):hover {',
    'background-color: rgba(255, 255, 255, 0.2);',
  '}',

  '.blocklyTreeSeparator {',
    'border-bottom: solid #e5e5e5 1px;',
    'height: 0;',
    'margin: 5px 0;',
  '}',

  '.blocklyTreeSeparatorHorizontal {',
    'border-right: solid #e5e5e5 1px;',
    'width: 0;',
    'padding: 5px 0;',
    'margin: 0 5px;',
  '}',

  '.blocklyTreeIcon {',
    'background-image: url(<<<PATH>>>/sprites.png);',
    'height: 16px;',
    'vertical-align: middle;',
    'width: 16px;',
    'visibility: hidden;',
  '}',

  '.blocklyTreeIconClosedLtr {',
    'background-position: -32px -1px;',
  '}',

  '.blocklyTreeIconClosedRtl {',
    'background-position: 0 -1px;',
  '}',

  '.blocklyTreeIconOpen {',
    'background-position: -16px -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedLtr {',
    'background-position: -32px -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedRtl {',
    'background-position: 0 -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
    'background-position: -16px -17px;',
  '}',

  '.blocklyTreeLabel {',
    'cursor: default;',
    'font: 16px sans-serif;',
    'padding: 0 3px;',
    'vertical-align: middle;',
  '}',

  '.blocklyToolboxDelete .blocklyTreeLabel {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyTreeSelected .blocklyTreeLabel {',
    'color: #fff;',
  '}'
  /* eslint-enable indent */
]);

Blockly.registry.register(Blockly.registry.Type.TOOLBOX, 'newtoolbox', Blockly.NewToolbox);
