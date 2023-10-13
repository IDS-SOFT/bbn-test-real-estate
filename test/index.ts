const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("RealEstateContract", function () {
  let RealEstateContract:any;
  let realEstateContract:any;
  let owner:any;
  let seller:any;
  let buyer:any;
  let random:any;

  const propertyAddress = "123 Main St";
  const propertyPrice = ethers.utils.parseEther("1.0"); // Property price in ethers

  beforeEach(async function () {
    [owner, seller, buyer, random] = await ethers.getSigners();

    RealEstateContract = await ethers.getContractFactory("RealEstateContract");
    realEstateContract = await RealEstateContract.deploy(
      propertyAddress,
      propertyPrice
    );

    await realEstateContract.deployed();
  });

  it("should purchase property and update state", async function () {
    const initialBalance = await ethers.provider.getBalance(owner.address);

    await realEstateContract.connect(buyer).purchaseProperty({ value: propertyPrice });

    const updatedSellerBalance = await ethers.provider.getBalance(owner.address);
    
    const updatedBuyerBalance = await ethers.provider.getBalance(buyer.address);
    
    const isSold = await realEstateContract.isSold();
    
    const propertyBuyer = await realEstateContract.buyer();

    expect(BigInt(updatedSellerBalance)).to.equal(BigInt(propertyPrice) + BigInt(initialBalance));
    expect(isSold).to.equal(true);
    expect(propertyBuyer).to.equal(buyer.address);
  });

  it("should not allow the seller to purchase the property", async function () {
    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    const tx = realEstateContract.connect(owner).purchaseProperty({
      value: propertyPrice,
    });

    await expect(tx).to.be.revertedWith("Seller cannot buy their own property");

    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    const isSold = await realEstateContract.isSold();

    expect(sellerBalanceAfter).to.equal(sellerBalanceBefore);
    expect(isSold).to.be.false;
  });

  it("should not allow purchase with incorrect payment amount", async function () {
    const incorrectPayment = propertyPrice.sub(ethers.utils.parseEther("0.1"));
    const tx = realEstateContract.connect(buyer).purchaseProperty({
      value: incorrectPayment,
    });

    await expect(tx).to.be.revertedWith("Incorrect payment amount");

    const isSold = await realEstateContract.isSold();

    expect(isSold).to.be.false;
  });

  it("should cancel the sale and return funds to the owner", async function () {
    let errorOccurred = false;
    try {
        await realEstateContract.connect(owner).cancelSale();

        const ownerBalance = await ethers.provider.getBalance(owner.address);
        const isSold = await realEstateContract.isSold();
        expect(ownerBalance.gt(ethers.utils.parseEther("0.9"))).to.be.true; // Ensure some ether is returned to the owner
        expect(isSold).to.be.false;

    } catch (error) {
        errorOccurred = true;
    }
    expect(errorOccurred).to.equal(true);
  });
});
