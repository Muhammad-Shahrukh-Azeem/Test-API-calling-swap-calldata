const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const TestDAI = await ethers.getContractFactory("TestDAI");
  const testDAI = await TestDAI.deploy();
  console.log("TestDAI address:", testDAI.target);

  const TestUSDT = await ethers.getContractFactory("TestUSDT");
  const testUSDT = await TestUSDT.deploy();
  console.log("TestUSDT address:", testUSDT.target);

  const SimpleAMM = await ethers.getContractFactory("SimpleAMM");
  const simpleAMM = await SimpleAMM.deploy(testDAI.target, testUSDT.target);
  console.log("SimpleAMM address:", simpleAMM.target);

  const liquidityAmountDAI = ethers.parseUnits("1000", 18); // for example
  const liquidityAmountUSDT = ethers.parseUnits("2000", 18); // for example
  await testDAI.approve(simpleAMM.target, liquidityAmountDAI);
  await testUSDT.approve(simpleAMM.target, liquidityAmountUSDT);

  await simpleAMM.addLiquidity(liquidityAmountDAI, liquidityAmountUSDT);
  console.log("Liquidity added to SimpleAMM");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
