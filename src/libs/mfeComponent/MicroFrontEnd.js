import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MFEContext } from "./context";

const MicroFrontEnd = props => {
  const { id, mfeHost } = props;
  const [mountNode, setMountNode] = useState();
  const [error, setError] = useState();
  const [el, setEl] = useState();
  const [mfeContainerDiv, setMfeContainerDiv] = useState();
  const mfeManager = useContext(MFEContext);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    setEl(
      document.getElementById(props.id) ||
        document.createElement("div").setAttribute("id", id)
    );
    setMfeContainerDiv(document.getElementById(props.target));
    try {
      mfeContainerDiv.appendChild(el);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`MicroFrontEnd: - Problem trying to mount : ${e}`);
    }
    mfeManager.getMountNode(id, mfeHost).then(
      mountNode => {
        setMountNode(mfeManager.setMountNode(id, mountNode));
        mfeManager.setScriptHost(mfeHost);
        forceUpdate();
      },
      error => {
        setError(error.message);
        forceUpdate();
      }
    );
  }, []);

  if (typeof error !== "undefined" && error) {
    return ReactDOM.createPortal(<div>{error}</div>, this.el);
  }
  return ReactDOM.createPortal(mountNode || loadingChild(), el);
};

const loadingChild = () => {
  return <div>Loading....</div>;
};
export default MicroFrontEnd;
