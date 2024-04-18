import { useEffect, createContext, useState } from "react";

export const CloudContext = createContext();

const Provider = ({ children }) => {
  const ethers = require("ethers");
  const [address, setAddress] = useState("");
  const [hasMeta, sethasMeta] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      sethasMeta(true);
    }
    //
    (async () => {
      if (localStorage.getItem("MetamaskCredientials")) {
        const Provider = new ethers.BrowserProvider(window.ethereum);
        const Signer = await Provider.getSigner();
        setAddress(Signer.address);
      }
    })();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async () => {
        const Provider = new ethers.BrowserProvider(window.ethereum);
        const Signer = await Provider.getSigner();
        setAddress(Signer.address);
      });
    }
  });

  return (
    <CloudContext.Provider value={{ address, setAddress, hasMeta }}>
      {children}
    </CloudContext.Provider>
  );
};

export default Provider;
