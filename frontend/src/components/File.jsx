import React, { useEffect, useState } from "react";
import UnCloud from "../EthereumF/UnCloud.json";
import Input from "./Input";
import { decrypt } from "../AESEncrDecr/encryptDecrypt";
import axios from "axios";

export default function File({ file }) {
  const ethers = require("ethers");

  const [allowedAddress, setAllowedAddress] = useState([]);
  const [shareAddress, setShareAddress] = useState("");

  const [openManageAccess, setopenManageAccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const manageAccess = async (Signer) => {
    // get All Adreess associated with each file
    try {
      const contractInstance = new ethers.Contract(
        UnCloud.contractAddress,
        UnCloud.abi,
        Signer
      );

      const result = await contractInstance.getAllAddress(file.metaID);

      setAllowedAddress(result);
      console.log(Array.from(result));
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async () => {
    try {
      const Provider = new ethers.BrowserProvider(window.ethereum);
      const Signer = await Provider.getSigner();
      manageAccess(Signer);
      const contractInstance = new ethers.Contract(
        UnCloud.contractAddress,
        UnCloud.abi,
        Signer
      );

      await contractInstance.shareDataWith(shareAddress, file.metaID);

      setAllowedAddress([...allowedAddress, ...shareAddress]);
      console.log("Sharing Done...Wait some time to reflect.");
    } catch (error) {
      console.log("error while sharing file");
    }
  };

  const editAccess = async (address) => {
    try {
      const Provider = new ethers.BrowserProvider(window.ethereum);
      const Signer = await Provider.getSigner();
      manageAccess(Signer);
      const contractInstance = new ethers.Contract(
        UnCloud.contractAddress,
        UnCloud.abi,
        Signer
      );

      await contractInstance.editAddressPermissions(address, file.metaID);

      console.log("access modified ...Wait some time to reflect.");
    } catch (error) {
      console.log("error while editing file");
    }
  };

  useEffect(() => {
    (async () => {
      const Provider = new ethers.BrowserProvider(window.ethereum);
      const Signer = await Provider.getSigner();
      manageAccess(Signer);
    })();
  }, []);

  return (
    <>
      <div className="flex items-center justify-around rounded-lg px-3 py-1.5 shadow-sm shadow-white/50 duration-300 text-black mb-2 ">
        <div
          onClick={async () => {
            // Fetch encrypted data from the IPFS
            const response = await axios.get(
              `https://gateway.pinata.cloud/ipfs/${file.tokenURI}`
            );

            // Decrypt the data
            decrypt(
              new Blob([response.data]),
              file.name.split(".")[1],
              file.secretKey
            );
          }}
          style={{ cursor: "pointer" }}
        >
          <i class="bx bx-file "></i>
        </div>
        <div>{file.metaID.toString()}</div>
        <div>
          {" "}
          {file.name.split(".")[0].substring(0, 6) +
            "..." +
            file.name.split(".")[1]}
        </div>

        <button
          className="w-20 h-10 rounded-lg text-sm text-rose-600 border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
          onClick={() => {
            setShowModal(true);
            openManageAccess
              ? setopenManageAccess(false)
              : setopenManageAccess(true);
          }}
        >
          Manage access
        </button>
      </div>
      {/* {openManageAccess ? <ManageAccess file={file} /> : null} */}

      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Access Members:</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto mb-3">
                  <ul>
                    {allowedAddress.map((addr, i) => {
                      return (
                        <li key={i}>
                          {addr.account}
                          <button
                            onClick={() => {
                              editAccess(addr.account);
                            }}
                          >
                            &rarr;
                            {addr.access ? (
                              <b>Remove Access</b>
                            ) : (
                              <b>Give Access</b>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <Input
                    type="text"
                    className="bg-slate-300 mt-3"
                    placeholder="Enter Address"
                    onChange={(e) => {
                      setShareAddress(e.target.value);
                      console.log(shareAddress);
                    }}
                  />
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      handleShare();
                    }}
                  >
                    Share File
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
