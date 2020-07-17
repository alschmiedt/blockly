/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbox category used to organize blocks in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author maribethb@google.com (Maribeth Bottorff)
 */
'use strict';

goog.provide('Blockly.ToolboxCategory');

/**
 * Class for a category in a toolbox.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The information needed
 *     to create a category in the toolbox.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 * @constructor
 * @implements {Blockly.IToolboxItem}
 */
Blockly.ToolboxCategory = function(categoryDef, toolbox) {

  /**
   * The name that will be displayed on the category.
   * @type {string}
   * @protected
   */
  this.name_ = categoryDef['name'];

  /**
   * The id for the category.
   * TODO: Is this a problem for xml?
   * @type {string}
   * @private
   */
  this.id_ = categoryDef["id"] || Blockly.utils.genUid();

  /**
   * The toolbox this category belongs to.
   * @type {!Blockly.IToolbox}
   * @protected
   */
  this.parentToolbox_ = toolbox;

  /**
   * The workspace of the parent toolbox.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = this.parentToolbox_.getWorkspace();

  /**
   * The definition used to create the category.
   * @type {!Blockly.utils.toolbox.Category}
   * @protected
   */
  this.categoryDef_ = categoryDef;

  var contents = categoryDef['contents'];

  /**
   * True if this category has subcategories, false otherwise.
   * @type {boolean}
   * @private
   */
  this.hasChildren_ = contents && contents.length &&
    typeof contents != 'string' &&
    contents[0].kind.toUpperCase() == 'CATEGORY';

  /**
   * Parse the contents for this category.
   * @type {string|Array<!Blockly.IToolboxItem>|Blockly.utils.toolbox.FlyoutDefinition}
   * @protected
   */
  this.contents_ = this.parseContents_(categoryDef, this.hasChildren_);

  /**
   * The colour of the category.
   * @type {string}
   * @protected
   */
  this.colour_ = this.getColour_(categoryDef);

  /**
   * The html container for the category.
   * @type {HTMLDivElement}
   * @protected
   */
  this.htmlDiv_ = null;

  /**
   * The html element for the category row.
   * @type {HTMLDivElement}
   * @protected
   */
  this.rowDiv_ = null;

  /**
   * The html element for the toolbox icon.
   * @type {HTMLSpanElement}
   * @protected
   */
  this.iconDiv_ = null;

  /**
   * Container for any children categories.
   * @type {HTMLDivElement}
   * @protected
   */
  this.subcategoriesDiv_ = null;

  var closedIcon = this.workspace_.RTL ?
      'blocklyTreeIconClosedRtl' : 'blocklyTreeIconClosedLtr';

  var horizontalClass = this.workspace_.RTL ?
      'blocklyHorizontalTreeRtl' : 'blocklyHorizontalTree';

  /**
   * The config for all the category css classes.
   * @type {Blockly.ToolboxCategory.ClassConfig}
   * @protected
   */
  this.classConfig_ = {
    'container': 'blocklyToolboxCategory',
    'row': 'blocklyTreeRow',
    'icon': 'blocklyTreeIcon',
    'label': 'blocklyTreeLabel',
    'contents': 'blocklyToolboxContents',
    'selected': 'blocklyTreeSelected',
    'openIcon': 'blocklyTreeIconOpen',
    'closedIcon': closedIcon,
    'horizontal': horizontalClass,
  };

  Blockly.utils.object.mixin(this.classConfig_, categoryDef['classConfig']);

  /**
   * Whether or not the category should display it's children.
   * @type {boolean}
   * @protected
   */
  this.expanded_ = categoryDef['expanded'] == 'true' || categoryDef['expanded'];

  /**
   * True if the category is visible, false otherwise.
   * @type {boolean}
   * @private
   */
  this.isVisible_ = true;

  /**
   * The parent of the category.
   * @type {Blockly.ToolboxCategory}
   */
  this.parent = null;

};

/**
 * @typedef {{
 *            container:?string,
 *            row:?string,
 *            icon:?string,
 *            label:?string,
 *            contents:?string,
 *            selected:?string,
 *            openIcon:?string,
 *            closedIcon:?string,
 *            horizontal:?string,
 *          }}
 */
Blockly.ToolboxCategory.ClassConfig;

/**
 * Parse the contents array depending on if the category has children, is a
 * dynamic category, or if it's contents are meant to be shown in the flyout.
 * @param {Blockly.utils.toolbox.Category} categoryDef The user given information
 *     about the category.
 * @param {boolean} hasChildren True if this category has subcategories, false
 *     otherwise.
 * @return {string|Array<!Blockly.IToolboxItem>|Blockly.utils.toolbox.FlyoutDefinition}
 *     The contents for this category.
 * @private
 */
Blockly.ToolboxCategory.prototype.parseContents_ = function(categoryDef, hasChildren) {
  var toolboxItems = [];
  var contents = categoryDef['contents'];
  if (hasChildren) {
    for (var i = 0; i < contents.length; i++) {
      var child = new Blockly.ToolboxCategory(contents[i], this.parentToolbox_);
      child.parent = this;
      toolboxItems.push(child);
    }
  } else if (categoryDef['custom']) {
    toolboxItems = categoryDef['custom'];
  } else {
    toolboxItems = contents;
  }

  return toolboxItems;
};

/**
 * Creates the dom for a toolbox category.
 * @return {HTMLDivElement} The div for the category.
 * @public
 */
Blockly.ToolboxCategory.prototype.createDom = function() {
  this.htmlDiv_ = document.createElement('div');
  Blockly.utils.dom.addClass(this.htmlDiv_, this.classConfig_['container']);
  this.htmlDiv_.setAttribute('data-id', this.id_);

  this.rowDiv_ = document.createElement('div');
  Blockly.utils.dom.addClass(this.rowDiv_, this.classConfig_['row']);
  Blockly.utils.aria.setRole(this.htmlDiv_, Blockly.utils.aria.Role.TREEITEM);
  Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.SELECTED, false);
  Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.EXPANDED, false);
  this.htmlDiv_.tabIndex = -1;
  this.htmlDiv_.appendChild(this.rowDiv_);

  if (this.parentToolbox_.isHorizontal()) {
    Blockly.utils.dom.addClass(this.htmlDiv_, this.classConfig_['horizontal']);
  }

  this.iconDiv_ = this.createIconSpan_();
  Blockly.utils.aria.setRole(this.iconDiv_, Blockly.utils.aria.Role.PRESENTATION);
  this.rowDiv_.appendChild(this.iconDiv_);

  var toolboxLabel = this.createLabelSpan_();
  this.rowDiv_.appendChild(toolboxLabel);
  // TODO: How can I try to make sure they have created a label with an id?
  Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.LABELLEDBY, toolboxLabel.getAttribute('id'));

  if (this.hasChildren()) {
    this.subcategoriesDiv_ = this.createSubCategories_(this.contents_);
    this.htmlDiv_.appendChild(this.subcategoriesDiv_);
  }
  this.rowDiv_.style.pointerEvents = 'none';

  this.addColour_(this.colour_);

  this.setExpanded(this.expanded_);

  return this.htmlDiv_;
};

/**
 * Add the strip of colour to the toolbox category.
 * @param {string} colour The category colour.
 * @protected
 */
Blockly.ToolboxCategory.prototype.addColour_ = function(colour) {
  if (colour) {
    var border = '8px solid ' + (colour || '#ddd');
    if (this.workspace_.RTL) {
      this.rowDiv_.style.borderRight = border;
    } else {
      this.rowDiv_.style.borderLeft = border;
    }
  }
};

/**
 * Create the dom for all subcategories.
 * @param {Blockly.utils.toolbox.Toolbox} contents The category contents.
 * @return {HTMLDivElement} The div holding all the subcategories.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createSubCategories_ = function(contents) {
  var contentsContainer = document.createElement('div');
  Blockly.utils.dom.addClass(contentsContainer, this.classConfig_['contents']);
  this.workspace_.RTL ? contentsContainer.style.paddingRight = '19px' :
      contentsContainer.style.paddingLeft = '19px';

  for (var i = 0; i < contents.length; i++) {
    var newCategory = this.contents_[i];
    var dom = newCategory.createDom();
    contentsContainer.appendChild(dom);
  }
  return contentsContainer;
};

/**
 * Creates the span that holds the category icon.
 * @return {HTMLSpanElement} The span that holds the category icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createIconSpan_ = function() {
  var toolboxIcon = document.createElement('span');
  if (!this.parentToolbox_.isHorizontal()) {
    Blockly.utils.dom.addClass(toolboxIcon, this.classConfig_['icon']);
    if (this.hasChildren()) {
      toolboxIcon.style.visibility = 'visible';
    }
  }

  toolboxIcon.style.display = 'inline-block';
  return toolboxIcon;
};

/**
 * Creates the span that holds the category label.
 * @return {HTMLSpanElement} The span that holds the category label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createLabelSpan_ = function() {
  var toolboxLabel = document.createElement('span');
  toolboxLabel.setAttribute('id', this.getId() + '.label');
  toolboxLabel.textContent = this.name_;
  Blockly.utils.dom.addClass(toolboxLabel, this.classConfig_['label']);
  return toolboxLabel;
};

/**
 * Add either the colour or the style for a category.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The object holding
 *    information on the category.
 * @return {string} The hex color for the category.
 * @protected
 */
Blockly.ToolboxCategory.prototype.getColour_ = function(categoryDef) {
  var styleName = categoryDef['categorystyle'];
  var colour = categoryDef['colour'];

  if (colour && styleName) {
    console.warn('Toolbox category "' + this.name_ +
        '" must not have both a style and a colour');
  } else if (styleName) {
    return this.getColourfromStyle_(styleName);
  } else {
    return this.parseColour_(colour);
  }
};

/**
 * Retrieves and sets the colour for the category using the style name.
 * The category colour is set from the colour style attribute.
 * @param {string} styleName Name of the style.
 * @return {string} The hex color for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.getColourfromStyle_ = function(styleName) {
  var theme = this.workspace_.getTheme();
  if (styleName && theme) {
    var style = theme.categoryStyles[styleName];
    if (style && style.colour) {
      return this.parseColour_(style.colour);
    } else {
      console.warn('Style "' + styleName +
          '" must exist and contain a colour value');
    }
  }
};

/**
 * Sets the colour on the category.
 * @param {number|string} colourValue HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {string} The hex color for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.parseColour_ = function(colourValue) {
  // Decode the colour for any potential message references
  // (eg. `%{BKY_MATH_HUE}`).
  var colour = Blockly.utils.replaceMessageReferences(colourValue);
  if (colour == null || colour === '') {
    // No attribute. No colour.
    return '';
  } else {
    var hue = Number(colour);
    if (!isNaN(hue)) {
      return Blockly.hueToHex(hue);
    } else {
      var hex = Blockly.utils.colour.parse(colour);
      if (hex) {
        return hex;
      } else {
        console.warn('Toolbox category "' + this.name_ +
            '" has unrecognized colour attribute: ' + colour);
        return '';
      }
    }
  }
};

/**
 * Whether or not this category has subcategories.
 * @return {boolean} True if this category has subcategories, false otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.hasChildren = function() {
  return this.hasChildren_;
};

/**
 * Event listener for when the category is clicked.
 * @param {Event} e Click event to handle.
 * @public
 */
Blockly.ToolboxCategory.prototype.onClick = function(e) {
  this.toggleExpanded();
};

/**
 * Adds appropriate classes to display an open icon.
 * @param {HTMLSpanElement} iconDiv The div that holds the icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.openIcon_ = function(iconDiv) {
  // TODO: Double check this.
  iconDiv.className = iconDiv.className.replace(' ' + this.classConfig_['closedIcon'], '');
  Blockly.utils.dom.addClass(iconDiv, this.classConfig_['openIcon']);
};

/**
 * Adds appropriate classes to display a closed icon.
 * @param {HTMLSpanElement} iconDiv The div that holds the icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.closeIcon_ = function(iconDiv) {
  iconDiv.className = iconDiv.className.replace(' ' + this.classConfig_['openIcon'], '');
  Blockly.utils.dom.addClass(iconDiv, this.classConfig_['closedIcon']);
};

/**
 * Updates the colour for this category.
 * @public
 */
Blockly.ToolboxCategory.prototype.refreshTheme = function() {
  this.colour_ = this.getColour_(this.categoryDef_);
  this.addColour_(this.colour_);
};

/**
 * Set the current category as selected.
 * @param {boolean} isSelected True if this category is selected, false otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.setSelected = function(isSelected) {
  if (isSelected) {
    this.rowDiv_.style.backgroundColor = this.colour_ || '#57e';
    Blockly.utils.dom.addClass(this.rowDiv_, this.classConfig_['selected']);
  } else {
    this.rowDiv_.style.backgroundColor = '';
    Blockly.utils.dom.removeClass(this.rowDiv_, this.classConfig_['selected']);
  }
  Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.SELECTED, isSelected);
};

/**
 * Opens or closes the current category if it has children.
 * @param {boolean} isExpanded True to expand the category, false to close.
 * @public
 */
Blockly.ToolboxCategory.prototype.setExpanded = function(isExpanded) {
  if (!this.hasChildren()) {
    return;
  }
  this.expanded_ = isExpanded;
  if (isExpanded) {
    this.subcategoriesDiv_.style.display = 'block';
    this.openIcon_(this.iconDiv_);
  } else {
    this.subcategoriesDiv_.style.display = 'none';
    this.closeIcon_(this.iconDiv_);
  }
  Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.EXPANDED, isExpanded);

  if (this.hasChildren()) {
    for (var i = 0; i < this.contents_.length; i++) {
      var child = this.contents_[i];
      child.setVisible(isExpanded);
      child.parent = this;
    }
  }

  Blockly.svgResize(this.workspace_);
};

/**
 * Toggle if this category is expanded.
 */
Blockly.ToolboxCategory.prototype.toggleExpanded = function() {
  this.setExpanded(!this.expanded_);
};

/**
 * Sets whether the category is visible or not. Categories are not visible if
 * they are the child of a parent who has been collapsed.
 * @param {boolean} isVisible True if category should be visible.
 * @public
 */
Blockly.ToolboxCategory.prototype.setVisible = function(isVisible) {
  // TODO: Add ability to hide the category when this is false.
  //  This causes problems for nested categories.
  this.isVisible_ = isVisible;
};

/**
 * Whether the category is visible.
 * @return {boolean} True if the category is visible, false otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.isVisible = function() {
  return this.isVisible_;
};

/**
 * Whether the category is expanded to show it's child subcategories.
 * @return {boolean} True if the category shows it's children, false if it is
 *     collapsed.
 * @public
 */
Blockly.ToolboxCategory.prototype.isExpanded = function() {
  return this.expanded_;
};

/**
 * Gets the name of the category.
 * @return {string} The name of the category.
 * @public
 */
Blockly.ToolboxCategory.prototype.getName = function() {
  return this.name_;
};

/**
 * Gets a unique identifier for the category.
 * @return {string} The id of the category.
 * @public
 */
Blockly.ToolboxCategory.prototype.getId = function() {
  return this.id_;
};

/**
 * Gets the div for the category.
 * @return {HTMLDivElement} The div for the category.
 * @public
 */
Blockly.ToolboxCategory.prototype.getDiv = function() {
  return this.htmlDiv_;
};


/**
 * Dispose of this category.
 * @public
 */
Blockly.ToolboxCategory.prototype.dispose = function() {
  Blockly.utils.dom.removeNode(this.htmlDiv_);
};
