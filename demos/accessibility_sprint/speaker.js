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
 * @fileoverview Methods for graphically rendering a cursor as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

/**
 * Class for a speaker.
 * @constructor
 */
Blockly.Speaker = function() {};

/**
 * Create the speaker.
 * @param {string} type The type of message.
 * @param {string} msg The message to read off.
 * @param {Blockly.ASTNode} node The new AST node.
 * @private
 */
Blockly.Speaker.prototype.speak = function(type, msg, oldNode, newNode) {
  if (type == 'log') {
    var text = msg;
  } else if (type == 'node') {
    var text = this.nodeToText(oldNode, newNode);
  }
  this.speakOut(text);
};

/**
 * Put the text in an aria div so the user can here.
 * @param {string} text The text to read out.
 */
Blockly.Speaker.prototype.speakOut = function(text) {
  var loggingElement = document.getElementById('loggingFeedback');
  if (loggingElement.innerText == 'Keyboard navigation on.') {
    loggingElement.innerText += ' ' + text;
  } else {
    loggingElement.innerText = text;
  }
};

/**
 * Read off the current node.
 * @param {Blockly.ASTNode} curNode The AST node to read off.
 * @return {string} The text to return.
 * @package
 */
Blockly.Speaker.prototype.nodeToText = function(oldNode, curNode) {
  var location = curNode.getLocation();
  var text = '';
  if (curNode.getType() == Blockly.ASTNode.types.BLOCK) {
    if (location.type == 'controls_if') {
      text += 'if 6 = 5';
    } else {
      if (curNode.getSourceBlock().getSurroundParent()) {
        text += 'inside if. ';
      } else if (oldNode && oldNode.getSourceBlock().getSurroundParent()) {
        text += 'outside if. ';
      }
      text += curNode.getLocation().toString();
    }
  } else if (curNode.getType() == Blockly.ASTNode.types.OUTPUT) {
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
    text += location.getDisplayText_() + ' ';
  } else if (curNode.getType() == Blockly.ASTNode.types.WORKSPACE) {
    text += ' a workspace coordinate';
  } else if (curNode.getType() == Blockly.ASTNode.types.STACK) {
    text += ' a stack of blocks';
  }
  return text;
};
