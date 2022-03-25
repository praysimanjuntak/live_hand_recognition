export function getCustomProperty(elem, prop) {
  if (elem.current) {
    return parseFloat(getComputedStyle(elem.current).getPropertyValue(prop)) || 0
  } else {
    return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
  }
}

export function setCustomProperty(elem, prop, value) {
  if (elem.current) {
    elem.current.style.setProperty(prop, value)
  } else {
    elem.style.setProperty(prop, value)
  }
}

export function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc)
}
