#!/bin/bash


# Warning: this script does not rename goog.math.Rect to Blockly.utils.Rect
# because the constructor format has changed:
# goog.math.Rect -> Blockly.utils.Rect
# new goog.math.Rect(left, top, width, height)
# new Blockly.utils.Rect(top, bottom, left, right)
# You may want to apply this change manually.

echo "Renaming Blockly functions in all .js files in this directory and subdirectories"
echo "You will also need to add the following provides to your util.js file:
goog.provide('Blockly.utils.dom');
goog.provide('Blockly.utils.string');
goog.provide('Blockly.utils.math');"

nameKeys=(
    Blockly.utils.toRadians
    Blockly.utils.toDegrees
    Blockly.utils.clampNumber
    Blockly.SVG_NS
    Blockly.HTML_NS
    Blockly.utils.createSvgElement
    Blockly.utils.addClass
    Blockly.utils.removeClass
    Blockly.utils.hasClass
    Blockly.utils.removeNode
    Blockly.utils.insertAfter
    Blockly.utils.containsNode
    Blockly.utils.setCssTransform
    Blockly.utils.startsWith
    Blockly.utils.shortestStringLength
    Blockly.utils.commonWordPrefix
    Blockly.utils.commonWordSuffix
    Blockly.utils.wrap
    Blockly.Xml.utils
    Blockly.BlockAnimations
    goog.math.Coordinate
    goog.userAgent
    goog.color
    goog.global
)

nameValues=(
    Blockly.utils.math.toRadians
    Blockly.utils.math.toDegrees
    Blockly.utils.math.clamp
    Blockly.utils.dom.SVG_NS
    Blockly.utils.dom.HTML_NS
    Blockly.utils.dom.createSvgElement
    Blockly.utils.dom.addClass
    Blockly.utils.dom.removeClass
    Blockly.utils.dom.hasClass
    Blockly.utils.dom.removeNode
    Blockly.utils.dom.insertAfter
    Blockly.utils.dom.containsNode
    Blockly.utils.dom.setCssTransform
    Blockly.utils.string.startsWith
    Blockly.utils.string.shortestStringLength
    Blockly.utils.string.commonWordPrefix
    Blockly.utils.string.commonWordSuffix
    Blockly.utils.string.wrap
    Blockly.utils.xml
    Blockly.blockAnimations
    Blockly.utils.Coordinate
    Blockly.utils.userAgent
    Blockly.utils.colour
    Blockly.utils.global
)

for (( i=0; i<${#nameKeys[@]}; i++ ))
do
  old_name=${nameKeys[$i]}
  new_name=${nameValues[$i]}
  echo "$old_name -> $new_name"
  find . -type f -name "*.js" -exec sed -i '' "s/$old_name/$new_name/g" {} +
done

git status
