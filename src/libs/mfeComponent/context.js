import React from "react";
import ReactDOM from "react-dom";

export class MFEManager {
  constructor(mfeStore = {}, loadedScriptsStore = {}) {
    this.store = mfeStore;
    this.loadedScriptsStore = loadedScriptsStore;
  }
  setMountNode(id, mountNode) {
    this.store[id] = this.store[id] || {};
    this.store[id].mountNode = this.store[id].mountNode || mountNode;
    return this.store[id].mountNode;
  }
  setInUse(id, inUse) {
    const container = this.store[id];
    if (container) {
      this.store.inUse = inUse;
      return container;
    }
    // console.log(`MicroFrontEnd: Failed to find mfe for ${id}`);
    return {};
  }
  inUse(id) {
    return this.store[id] ? this.store[id].inUse || false : false;
  }
  storeKeys(label) {
    for (let [key, value] of Object.entries(this.store)) {
      // eslint-disable-next-line no-console
      console.log(label, `${key}: ${value}`);
    }
  }
  getMountNodeById(id) {
    return (this.store[id] || {}).mountNode;
  }
  updateMfeStore(id, obj) {
    this.store[id] = { ...(this.store[id] || {}), ...obj };
  }
  setScriptHost(scriptHost) {
    this.loadedScriptsStore[`${scriptHost}`] = true;
  }
  isScriptLoaded(scriptHost) {
    return typeof this.loadedScriptsStore[`${scriptHost}`] !== "undefined";
  }

  getMountNode(id, mfeHost) {
    let mountNode;
    this.storeKeys("MFE Store Entry: ");
    if (typeof (mountNode = this.getMountNodeById(id)) !== "undefined") {
      this.setInUse(id, true);
      return Promise.resolve(mountNode);
    } else {
      const newMountNode = document.createElement("div");
      newMountNode.setAttribute("id", mfeHost.name);
      this.updateMfeStore(id, {
        inUse: true,
        container: newMountNode
      });
      this.storeKeys("MFE Store Entry After Adding: ");
      return new Promise((resolve, reject) => {
        // console.log(`is ${id} loaded: ${this.isScriptLoaded()}.`);
        if (!this.isScriptLoaded()) {
          this.loadMfe(mfeHost, newMountNode, resolve, reject);
        } else {
          // Script is already loaded, all we had to do was mount
          // This can happen if we pull in the same microui multiple times
          this.renderMicroFrontEnd(mfeHost.name, resolve, reject);
        }
      });
    }
  }
  removeMountNode(id) {
    try {
      const container = this.setInUse(id, false);
      setTimeout(() => {
        if (!this.inUse(id)) {
          ReactDOM.unmountComponentAtNode(container);
        }
      }, 0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(
        `MicroFrontEnd: - Problem trying to remove mount node : ${err}`
      );
    }
  }
  renderMicroFrontEnd(name, resolve, reject, mfeManager) {
    try {
      resolve(window[`render${name}`](mfeManager));
    } catch (err) {
      reject(new Error(`Problem mounting Microi - ${err}`));
    }
  }
  loadMfe({ name, host, path = "" }, newMountNode, resolve, reject) {
    const scriptId = `micro-frontend-script-${name}`;
    const renderMicroFrontEndWrapper = () =>
      this.renderMicroFrontEnd(name, resolve, reject, this);
    fetch(`${host}${path}/asset-manifest.json`)
      .then(res => res.json())
      .then(manifest => {
        // Setup to work with webpack dev server
        const isLive = manifest.files;
        const script = document.createElement("script");
        const src = isLive ? manifest.files["main.js"] : manifest["main.js"];
        script.id = scriptId;
        script.src = `${host}${isLive ? path : ""}${src}`;
        script.onload = renderMicroFrontEndWrapper;
        document.head.appendChild(script);
      });
  }
}
export const MFEContext = React.createContext({ mfeManager: new MFEManager() });
