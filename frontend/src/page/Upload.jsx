import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { IoCloudUploadOutline } from "react-icons/io5";
import axios from "axios";
import UnCloud from "../EthereumF/UnCloud.json";
import { useNavigate } from "react-router-dom";
import { encrypt, createSecret256 } from "../AESEncrDecr/encryptDecrypt";
import { LineWave, ThreeDots } from "react-loader-spinner";

const Upload = () => {
  const navigator = useNavigate();
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [runLoader, setRunLoader] = useState(false);

  const handleUploadClick = () => {
    // Trigger the file input click event
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    // Handle the selected files
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    // console.log(process.env.REACT_APP_API_Key);
  };

  const removeFile = (index) => {
    // Remove the file from the selectedFiles array
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  //Upload to IPFS
  const UploadToIpfs = async () => {
    try {
      setRunLoader(true);
      // Append each file with a unique key
      for (let i = 0; i < selectedFiles.length; i++) {

        const secretKey = createSecret256();
        const encryptBlobData = await encrypt(selectedFiles[i], secretKey);

        // const encryptFile = new File([encryptBlobData], selectedFiles[i].name);
        const formData = new FormData();
        formData.append("file", encryptBlobData);

        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            maxBodyLength: "Infinity",
            headers: {
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
              pinata_api_key: process.env.REACT_APP_API_Key,
              pinata_secret_api_key: process.env.REACT_APP_API_Secret,
            },
          }
        );

        await uploadToBlockchain(
          res.data.IpfsHash,
          selectedFiles[i].name,
          secretKey
        );
      }

      alert("File Uploaded.");
      setSelectedFiles([]);
      setRunLoader(false);
    } catch (error) {
      console.log(error);
      setRunLoader(false);
      setError(error.message);
    }
  };

  const uploadToBlockchain = async (hashVal, name, secretKey) => {
    const ethers = require("ethers");
    setError("");
    try {
      const Provider = new ethers.BrowserProvider(window.ethereum);
      const Signer = await Provider.getSigner();

      const contractInstance = new ethers.Contract(
        UnCloud.contractAddress,
        UnCloud.abi,
        Signer
      );

      await contractInstance.storeMetaData(hashVal, name, secretKey);
    } catch (error) {
      if (error.code === 4001) {
        //user rejected the transaction
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem("MetamaskCredientials")) {
        alert("Connect To metamask");
        navigator("/");
      }
    })();
  }, []);

  return (
    <div className="absolute right-0 top-0 w-4/5 flex items-center justify-center h-screen">
      <div className="flex flex-col items-center space-y-4">
        {/* Display selected files */}
        {selectedFiles.length > 0 ? (
          <div className="flex items-center space-x-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none my-4"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Display the circle for the file upload symbol when no files are selected
          <label
            htmlFor="fileInput"
            className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer"
          >
            {/* You can add an icon or any content inside the circle */}
            <span className="text-white" onClick={handleUploadClick}>
              <IoCloudUploadOutline />
            </span>
          </label>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />

        {/* Button to trigger file upload */}
        <div>
          <Button
            type="button"
            onClick={handleUploadClick}
            className="text-white rounded-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Select File
          </Button>
          {selectedFiles.length > 0 ? (
            <Button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
              }}
              className="text-white rounded-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Remove All
            </Button>
          ) : (
            <></>
          )}
        </div>

        <div className="">
          {runLoader ? (
            <ThreeDots
              visible={true}
              height="80"
              width="80"
              color="blue"
              radius="9"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : selectedFiles.length > 0 ? (
            <Button
              type="button"
              className="text-white rounded-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={UploadToIpfs}
            >
              {"Upload"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Upload;
