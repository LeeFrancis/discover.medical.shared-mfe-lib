import React from "react";

const mfe = {
  store: {}
};

export const MFEContext = React.createContext(
  mfe // default value
);

export const getLoaded = () => {
  alert("here");
};
