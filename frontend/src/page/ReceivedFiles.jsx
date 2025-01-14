import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import UnCloud from "../EthereumF/UnCloud.json";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { decrypt } from "../AESEncrDecr/encryptDecrypt";

function ReceivedFiles() {
  const ethers = require("ethers");
  const navigator = useNavigate();
  const [runLoader, setRunLoader] = useState(false);
  const [sharedFiles, setSharedFiles] = useState([]);

  const getSharedFiles = async (Signer) => {
    try {
      const contractInstance = new ethers.Contract(
        UnCloud.contractAddress,
        UnCloud.abi,
        Signer
      );

      const result = await contractInstance.getMySharedData();
      setSharedFiles(result);

      console.log(Array.from(result));
    } catch (error) {
      alert("Failed to Upload file...");
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      if (localStorage.getItem("MetamaskCredientials")) {
        const Provider = new ethers.BrowserProvider(window.ethereum);
        const Signer = await Provider.getSigner();
        getSharedFiles(Signer);
      } else {
        alert("Connect To metamask");
        navigator("/");
      }
    })();

    window.ethereum.on("accountsChanged", async () => {
      const Provider = new ethers.BrowserProvider(window.ethereum);
      const Signer = await Provider.getSigner();
      getSharedFiles(Signer);
    });
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-around mb-3 font-extrabold text-white bg-gray-500 p-3 m-2 rounded-sm">
        <div>File</div>
        <div>Owner</div>
        <div>Name</div>
      </div>
      <div
        className="flex flex-col custom-scroll border-b"
        style={{ height: "80vh", overflowY: "auto" }}
      >
        {sharedFiles.length > 0 ? (
          sharedFiles.map((file, i) =>
            file.metaID ? (
              <div className="flex justify-around list-none m-0 p-3 font-bold">
                <div
                  onClick={async () => {
                    setRunLoader(true);
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
                    setRunLoader(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {runLoader ? (
                    <ThreeDots
                      visible={true}
                      height="20"
                      width="20"
                      color="blue"
                      radius="9"
                      ariaLabel="three-dots-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  ) : (
                    <i class="bx bx-file "></i>
                  )}
                </div>
                <div>
                  {file.owner.substring(0, 4) +
                    "..." +
                    file.owner.substring(
                      file.owner.length - 5,
                      file.owner.length
                    )}
                </div>
                <div>{file.name}</div>
              </div>
            ) : null
          )
        ) : (
          <div className="text-center ">No File Shared</div>
        )}
      </div>
      <div className="text-center text-gray-500 mt-2.5">
        made by <b>@VPKBIET, Baramati</b>
      </div>
    </div>
  );
}

export default ReceivedFiles;
