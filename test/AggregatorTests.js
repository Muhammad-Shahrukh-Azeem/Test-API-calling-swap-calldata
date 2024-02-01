const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleAMM", function () {
  let testDAI, testUSDT, simpleAMM, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const TestDAI = await ethers.getContractFactory("TestDAI");
    testDAI = await TestDAI.deploy();
    // console.log("TestDAI deployed to:", testDAI.target);

    const TestUSDT = await ethers.getContractFactory("TestUSDT");
    testUSDT = await TestUSDT.deploy();
    // console.log("TestUSDT deployed to:", testUSDT.target);

    const SimpleAMM = await ethers.getContractFactory("SimpleAMM");
    simpleAMM = await SimpleAMM.deploy(testDAI.target, testUSDT.target);
    // console.log("SimpleAMM deployed to:", simpleAMM.target);

    await testDAI.transfer(user.address, ethers.parseUnits("1000"));
    await testUSDT.transfer(user.address, ethers.parseUnits("1000"));

    await testDAI.approve(simpleAMM.target, ethers.parseUnits("10000000"));
    await testUSDT.approve(simpleAMM.target, ethers.parseUnits("10000000"));
    await testDAI.connect(user).approve(simpleAMM.target, ethers.parseUnits("10000000"));
    await testUSDT.connect(user).approve(simpleAMM.target, ethers.parseUnits("10000000"));

    await simpleAMM.addLiquidity(ethers.parseUnits("1000"), ethers.parseUnits("1000"));
  });


  describe("Deployment", function () {
    it("Should deploy the AMM and set initial reserves", async function () {
      const reserve1 = await simpleAMM.reserve1();
      const reserve2 = await simpleAMM.reserve2();

      expect(reserve1).to.equal(ethers.parseUnits("1000"));
      expect(reserve2).to.equal(ethers.parseUnits("1000"));
    });
  });

  describe("Liquidity", function () {
    it("Should allow adding liquidity", async function () {
      await simpleAMM.addLiquidity(ethers.parseUnits("500"), ethers.parseUnits("500"));

      const reserve1 = await simpleAMM.reserve1();
      const reserve2 = await simpleAMM.reserve2();

      expect(reserve1).to.equal(ethers.parseUnits("1500"));
      expect(reserve2).to.equal(ethers.parseUnits("1500"));
    });
  });

  describe("Swapping", function () {
    it("Should allow token swaps", async function () {
      const swapAmount = ethers.parseUnits("100");

      await simpleAMM.connect(user).swap(user.address, testDAI.target, swapAmount);

      const userDAIBalance = await testDAI.balanceOf(user.address);
      const userUSDTBalance = await testUSDT.balanceOf(user.address);
      const reserve1 = await simpleAMM.reserve1();
      const reserve2 = await simpleAMM.reserve2();

      expect(userDAIBalance).to.be.below(ethers.parseUnits("1000"));
      expect(userUSDTBalance).to.be.above(ethers.parseUnits("1000"));
      expect(reserve1).to.be.above(ethers.parseUnits("1000"));
      expect(reserve2).to.be.below(ethers.parseUnits("1000"));
    });
  });

  describe("Swap Execution", function () {
    it("Should execute swap call data", async function () {
      const swapAmount = ethers.parseUnits("10");
      const swapCallData = simpleAMM.interface.encodeFunctionData("swap", [user.address, testDAI.target, swapAmount]);

      const calls = [{
        origin: user.address,
        target: simpleAMM.target,
        data: swapCallData
      }];


      await simpleAMM.connect(user).execute(calls);

      const finalUserToken1Balance = await testDAI.balanceOf(user.address);
      const finalUserToken2Balance = await testUSDT.balanceOf(user.address);

      expect(finalUserToken1Balance).to.be.below(ethers.parseUnits("1000"));
      expect(finalUserToken2Balance).to.be.above(ethers.parseUnits("1000"));

    });
  });

});
