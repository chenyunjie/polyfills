/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import CustomElementInternals from './CustomElementInternals';
import CustomElementRegistry from './CustomElementRegistry';
import DocumentConstructionObserver from './DocumentConstructionObserver';

import PatchHTMLElement from './Patch/HTMLElement';
import PatchDocument from './Patch/Document';
import PatchNode from './Patch/Node';
import PatchElement from './Patch/Element';

if (!window['customElements'] || window['customElements']['forcePolyfill']) {
  /** @type {!CustomElementInternals} */
  const internals = new CustomElementInternals();

  PatchHTMLElement(internals);
  PatchDocument(internals);
  PatchNode(internals);
  PatchElement(internals);

  /** @type {!CustomElementRegistry} */
  const customElements = new CustomElementRegistry(internals);

  // If `customElements.documentReady` exists and is a Promise, prevent calls to
  // define from causing upgrades until `documentReady` has resolved.
  const documentReady = window['customElements']['documentReady'];
  if (documentReady && documentReady.then instanceof Function) {
    customElements.setUpgradeOnDefine(false);
    documentReady.then(function() {
      customElements.setUpgradeOnDefine(true);
      internals.upgradeTree(document);
    });
  } else {
    new DocumentConstructionObserver(internals, document);
  }

  Object.defineProperty(window, 'customElements', {
    configurable: true,
    enumerable: true,
    value: customElements,
  });
}
