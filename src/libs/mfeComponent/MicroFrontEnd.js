import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MFEContext } from "./context";

const MicroFrontEnd = props => {
  const { id, mfeHost, target, mfeEntryPoint } = props;
  const [mountNode, setMountNode] = useState();
  const [error, setError] = useState();
  let [el, setEl] = useState();
  const { mfeManager } = useContext(MFEContext);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  if (!el) {
    el = document.createElement("div");
    el.setAttribute("id", id);
    setEl(el);
  }
  useEffect(() => {
    const mfeContainerDiv = document.getElementById(target);
    try {
      mfeContainerDiv.appendChild(el);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`MicroFrontEnd: - Problem trying to mount : ${e}`);
    }
    mfeManager.getMountNode(id, mfeHost).then(
      mountNode => {
        setMountNode(mfeManager.setMountNode(id, mountNode, mfeEntryPoint));
        mfeManager.setScriptHost(mfeHost);
        forceUpdate();
      },
      error => {
        setError(error.message);
        forceUpdate();
      }
    );
  }, [el, forceUpdate, id, mfeHost, mfeManager, target]);

  if (typeof error !== "undefined" && error) {
    return ReactDOM.createPortal(<div>{error}</div>, el);
  }
  return ReactDOM.createPortal(mountNode || loadingChild(), el);
};

const loadingChild = () => {
  return <div>Loading....</div>;
};
export default MicroFrontEnd;
