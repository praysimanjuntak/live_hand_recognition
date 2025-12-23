/**
 * Get the DOM element from either a ref object or direct element
 */
function getElement(elem) {
  return elem.current || elem;
}

/**
 * Get a CSS custom property value as a number
 */
export function getCustomProperty(elem, prop) {
  const element = getElement(elem);
  return parseFloat(getComputedStyle(element).getPropertyValue(prop)) || 0;
}

/**
 * Set a CSS custom property value
 */
export function setCustomProperty(elem, prop, value) {
  const element = getElement(elem);
  element.style.setProperty(prop, value);
}

/**
 * Increment a CSS custom property by a given amount
 */
export function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc);
}
