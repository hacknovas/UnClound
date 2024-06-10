const { expect } = require("chai");

describe("Uncloud", async () => {
  it("All Checks", async () => {
    const [owner, second, third] = await ethers.getSigners();
    console.log("\nOwner Address: ", owner.address);
    const instance = await ethers.deployContract("UnCloud");
    const createT = await instance.storeMetaData("Data", "Mahi", "key");
    const token = await instance._metaID();
    console.log("\nToken ID: ", token);
    const mynft = await instance.getMyData();
    console.log("\nMy Meta Data", mynft);
    const shareNFT = await instance.shareDataWith(second.address, 1);
    const getAlladdrr = await instance.connect(owner).getAllAddress(1);
    console.log("\nShared Address: ", getAlladdrr);
    const viewNFT = await instance.connect(second).viewMetaData(1);
    console.log("\nGet MetaData Using Second Address: ", viewNFT);
    const getAllNFT = await instance.connect(second).getMySharedData();
    console.log("\nGet All MetaData: ", getAllNFT);
  });
});
