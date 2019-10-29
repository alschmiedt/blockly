/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This class is in charge of figuring out what text to create when
 * a user moves around using keyboard navigation.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

Blockly.speak = {};
/**
 * Takes in an event and gives back a string for the screen reader.
 * TODO: Move this into some kind of speak file instead of in navigation.
 * @type {?function(Event, string)}
 * @public
 */
Blockly.speak.eventToText = null;

Blockly.speak.cursorToText = function(oldNode, curNode) {
  var location = curNode.getLocation();
  var text = '';
  if (curNode.getType() == Blockly.ASTNode.types.BLOCK) {
    if (location.type == 'controls_if') {
      text += 'if 6 = 5';
    } else {
      text += curNode.getLocation().toString();
    }
  } else if (curNode.getType() == Blockly.ASTNode.types.OUTPUT) {
    text += ' an output connection for block ';
    text += curNode.getSourceBlock().toString();
  } else if (curNode.getLocation().type == Blockly.INPUT_VALUE) {
    text += ' an input value for block ';
    text += curNode.getSourceBlock().toString();
  } else if (curNode.getLocation().type == Blockly.NEXT_STATEMENT) {
    text += ' a next connection for block '
    text += curNode.getSourceBlock().toString();
  } else if (curNode.getType() == Blockly.ASTNode.types.PREVIOUS) {
    text += ' a previous connection for block ';
    text += curNode.getSourceBlock().toString();
  } else if (curNode.getType() == Blockly.ASTNode.types.FIELD) {
    text += ' a field ' + location.getDisplayText_() + ' ';
    text += 'To open the field press enter';
  } else if (curNode.getType() == Blockly.ASTNode.types.WORKSPACE) {
    text += ' a workspace coordinate';
  } else if (curNode.getType() == Blockly.ASTNode.types.STACK) {
    text += ' a stack of blocks';
  }
  return text;
};

Blockly.speak.markerToText = function(oldNode, newNode) {
  var location = newNode.getLocation();
  return 'marker';
};

Blockly.speak.categoryToText = function(categoryName) {
  return 'You have opened ' + categoryName + ' toolbox. To look through blocks ' + 
      'hit the in key';

};

Blockly.speak.actionToKeyName = function(action) {
  var keyCode = Blockly.user.keyMap.getKeyByAction(action);
  var keyName = String.fromCharCode(keyCode);
  return keyName;

};

Blockly.speak.eventToText = function(e) {
  var text = '';
  if (e.element == 'cursorMove') {
    text = Blockly.speak.cursorToText(e.oldValue, e.newValue);
  } else if (e.element == 'markedNode') {
    text = Blockly.speak.markerToText(e.oldValue, e.newValue);
  } else if (e.element == 'category') {
    text = Blockly.speak.categoryToText(e.newValue);
  }
  return text;
};
