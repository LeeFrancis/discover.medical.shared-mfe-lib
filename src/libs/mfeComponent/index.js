import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { MFEContext } from "./context";

const renderMicroFrontEnd = (name, resolve, reject) => {
  try {
    console.log(`calling render${name}`);
    resolve(window[`render${name}`]());
  } catch (err) {
    reject(new Error(`Problem mounting Microi - ${err}`));
  }
};

const loadMfe = ({ name, host, path = "" }, newMountNode, resolve, reject) => {
  const scriptId = `micro-frontend-script-${name}`;
  const renderMicroFrontEndWrapper = () =>
    renderMicroFrontEnd(name, resolve, reject);
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
};

const getMountNode = (mfeStore, id, mfeHost) => {
  let mountNode;
  mfeStore.storeKeys("MFE Store Entry: ");
  if (typeof (mountNode = mfeStore.getMountNodeById(id)) !== "undefined") {
    mfeStore.setInUse(id, true);
    return Promise.resolve(mountNode);
  } else {
    const newMountNode = document.createElement("div");
    newMountNode.setAttribute("id", mfeHost.name);
    mfeStore.updateMfeStore(id, {
      inUse: true,
      container: newMountNode
    });
    mfeStore.storeKeys("MFE Store Entry After Adding: ");
    return new Promise((resolve, reject) => {
      if (!mfeStore.isScriptLoaded()) {
        loadMfe(mfeHost, newMountNode, resolve, reject);
      } else {
        // Script is already loaded, all we had to do was mount
        // This can happen if we pull in the same microui multiple times
        renderMicroFrontEnd(mfeHost.name, resolve, reject);
      }
    });
  }
};

const removeMountNode = (store, id) => {
  try {
    const container = store.setInUse(id, false);
    setTimeout(() => {
      if (!store.inUse(id)) {
        ReactDOM.unmountComponentAtNode(container);
      }
    }, 0);
  } catch (err) {
    console.log(
      `MicroFrontEnd: - Problem trying to remove mount node : ${err}`
    );
  }
};

export default class MicroFrontEnd extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    mfeHost: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired
  };
  static contextType = MFEContext;

  constructor(props, context) {
    super(props, context);
    this.mfeStore = manageMFEStore(context.store);
    this.mfeContainerDiv = document.getElementById(props.target);
    this.el = document.createElement("div");
    this.el.setAttribute("id", props.id);
  }
  componentDidMount() {
    try {
      this.mfeContainerDiv.appendChild(this.el);
    } catch (e) {
      console.log(`MicroFrontEnd: - Problem trying to mount : ${e}`);
    }
    getMountNode(this.mfeStore, this.props.id, this.props.mfeHost).then(
      mountNode => {
        const { id } = this.props;
        this.mountNode = this.mfeStore.setMountNode(id, mountNode);
        this.mfeStore.setScriptHost(this.props.mfeHost);
        this.forceUpdate();
      },
      error => {
        this.error = error.message;
        this.forceUpdate();
      }
    );
  }

  componentWillUnmount() {
    console.log("componentWillUnmount : unmounting", this.props.id);
    removeMountNode(this.mfeStore, this.props.id);
  }

  render() {
    console.log("rendering");
    if (typeof this.error !== "undefined" && this.error) {
      return ReactDOM.createPortal(<div>{this.error}</div>, this.el);
    }
    return ReactDOM.createPortal(this.mountNode || loadingChild(), this.el);
  }
}

const loadingChild = props => {
  return <div>Loading....</div>;
};

const manageMFEStore = (mfeStore, loadedScriptsStore = {}) => ({
  setMountNode: (id, mountNode) => {
    mfeStore[id] = mfeStore[id] || {};
    mfeStore[id].mountNode = mfeStore[id].mountNode || mountNode;
    return mfeStore[id].mountNode;
  },
  setInUse: (id, inUse) => {
    const container = mfeStore[id];
    if (container) {
      mfeStore.inUse = inUse;
      return container;
    }
    console.log(`MicroFrontEnd: Failed to find mfe for ${id}`);
    return {};
  },
  inUse: id => {
    return mfeStore[id] ? mfeStore[id].inUse || false : false;
  },
  storeKeys: label => {
    for (let [key, value] of Object.entries(mfeStore)) {
      console.log(label, `${key}: ${value}`);
    }
  },
  getMountNodeById: id => {
    return (mfeStore[id] || {}).mountNode;
  },
  updateMfeStore: (id, obj) => {
    mfeStore[id] = { ...(mfeStore[id] || {}), ...obj };
  },
  setScriptHost: scriptHost => {
    loadedScriptsStore[`${scriptHost}`] = true;
  },
  isScriptLoaded: scriptHost => {
    return typeof loadedScriptsStore[`${scriptHost}`] !== "undefined";
  }
});
