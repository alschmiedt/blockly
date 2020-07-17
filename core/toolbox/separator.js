/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A separator used for separating toolbox categories.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author maribethb@google.com (Maribeth Bottorff)
 */
'use strict';

goog.provide('Blockly.ToolboxSeparator');

goog.require('Blockly.ToolboxItem');

goog.requireType('Blockly.IToolboxItem');


/**
 * Class for a toolbox separator.
 * @param {!Blockly.utils.toolbox.Separator} toolboxSeparatorDef The information
 *     needed
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 * @constructor
 * @implements {Blockly.IToolboxItem}
 * @extends {Blockly.ToolboxItem}
 */
Blockly.ToolboxSeparator = function(toolboxSeparatorDef, toolbox) {

  Blockly.ToolboxSeparator.superClass_.constructor.call(
      this, toolboxSeparatorDef, toolbox);
  /**
   * The config for all the separator classes.
   * @type {Object}
   * @protected
   */
  this.classConfig_ = {

  };

  Blockly.utils.object.mixin(this.classConfig_, toolboxSeparatorDef['classConfig']);
};
Blockly.utils.object.inherits(Blockly.ToolboxSeparator, Blockly.ToolboxItem);

/**
 * Create the dom for a toolbox separator.
 * @return {HTMLDivElement} The div for the separator.
 */
Blockly.ToolboxSeparator.prototype.createDom = function() {
  // TODO: Figure out what spans and divs are actually necessary for this.
  var treeSeparatorContainer = document.createElement('div');
  if (this.parentToolbox_.isHorizontal()) {
    treeSeparatorContainer.classList.add('blocklyTreeSeparatorHorizontal');
    if (this.workspace_.RTL) {
      treeSeparatorContainer.classList.add('blocklyHorizontalTreeRtl');
    } else {
      treeSeparatorContainer.classList.add('blocklyHorizontalTree');
    }
  } else {
    treeSeparatorContainer.classList.add('blocklyTreeSeparator');
  }
  this.htmlDiv_ = treeSeparatorContainer;
  return treeSeparatorContainer;
};

Blockly.ToolboxSeparator.prototype.getDiv = function() {
  return this.htmlDiv_;
};

/**
 * Dispose of this separator.
 */
Blockly.ToolboxSeparator.prototype.dispose = function() {
  // TODO: Dispose of the toolbox category.
};

