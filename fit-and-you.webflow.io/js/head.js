"use strict";

// Add Webflow's JavaScript and touch capability classes.
(function initializeWebflowClasses(windowObject, documentObject) {
  const documentElement = documentObject.documentElement;
  const classPrefix = " w-mod-";

  documentElement.className += `${classPrefix}js`;

  if (
    "ontouchstart" in windowObject ||
    (windowObject.DocumentTouch &&
      documentObject instanceof windowObject.DocumentTouch)
  ) {
    documentElement.className += `${classPrefix}touch`;
  }
})(window, document);
