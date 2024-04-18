import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import Button from "./Button";
import { CloudContext } from "../ContextAPI/Provider";

const Sidebar = () => {
  const ethers = require("ethers");
  // const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/');
  // const [address, setAddress] = useState("");
  const [UserName, setUserName] = useState("");
  const { address, setAddress, hasMeta } = useContext(CloudContext);
  const [conMessange, setConMessange] = useState(true);

  const handleConnection = async () => {
    try {
      const Provider = new ethers.BrowserProvider(window.ethereum);
      const Signer = await Provider.getSigner();
      setAddress(Signer.address);
      // const name = await provider.lookupAddress(address);
      // setUserName(name);

      // store data locally
      localStorage.setItem("MetamaskCredientials", true);
    } catch (error) {
      alert("Failed to connect to Metamask\nTry again");
    }
  };

  const handleLogout = async () => {};

  return (
    <div
      className="flex flex-col justify-between h-screen w-1/5 bg-gray-800 p-4"
      id="switchMenu"
    >
      <div>
        <div className="text-end text-white">
          <i className="bx bx-menu cursor-pointer"></i>
        </div>
        <div>
          <p className="text-3xl text-white mb-4">{UserName}</p>
          <div className=" text-white ">
            {address == "" ? (
              hasMeta ? (
                <button
                  className="bg-white text-black"
                  onClick={handleConnection}
                >
                  Connect to Metamask
                </button>
              ) : (
                <button className="bg-white text-black">
                  <a href="https://metamask.io/download/" target="_blank">
                    Install Matamask
                  </a>
                </button>
              )
            ) : (
              <div className="bg-gray-700 p-3 rounded-md">
                <div className="text-start font-bold">Uncloud Address:</div>
                <div className="text-light text-end underline ">
                  <a href={`https://sepolia.etherscan.io/address/${address}`}>
                    {address.substring(0, 4) +
                      "..." +
                      address.substring(address.length - 5, address.length)}
                  </a>
                </div>
                {/* <div className="text-xl">
                <CiLogout onClick={handleLogout} />
              </div> */}
              </div>
            )}
          </div>
        </div>
        {/* Navigation Bar */}
      </div>
      {hasMeta ? (
        <div className="">
          <ul className="my-14">
            <li className="mb-2">
              <Link
                to="upload"
                className="text-white block bg-gray-700 py-2 px-4 rounded-md"
              >
                Upload file
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="managefiles"
                className="text-white block bg-gray-700 py-2 px-4 rounded-md"
              >
                Uploaded files
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="recievedfile"
                className="text-white block bg-gray-700 py-2 px-4 rounded-md"
              >
                Received file
              </Link>
            </li>
          </ul>
        </div>
      ) : (
        <div className="text-white">
          <b>
            To Use UnCloud,
            <br /> install Matamask
          </b>
        </div>
      )}
      {/* Logout Button */}

      <Button
        className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer text-white text-2xl font-extrabold mt-4"
        onClick={handleLogout}
      >
        <CiLogout />
      </Button>
    </div>
  );
};

export default Sidebar;
