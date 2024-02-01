const hre = require("hardhat");
const fs = require('fs');

let testDAI, testUSDT, simpleAMM;

async function deployContract() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TestDAI = await ethers.getContractFactory("TestDAI");
  testDAI = await TestDAI.deploy();
  console.log("TestDAI address:", testDAI.target);

  const TestUSDT = await ethers.getContractFactory("TestUSDT");
  testUSDT = await TestUSDT.deploy();
  console.log("TestUSDT address:", testUSDT.target);

  const SimpleAMM = await ethers.getContractFactory("SimpleAMM");
  simpleAMM = await SimpleAMM.deploy(testDAI.target, testUSDT.target);
  console.log("SimpleAMM address:", simpleAMM.target);

  const liquidityAmountDAI = ethers.parseUnits("1000", 18); // for example
  const liquidityAmountUSDT = ethers.parseUnits("2000", 18); // for example
  await testDAI.approve(simpleAMM.target, liquidityAmountDAI);
  await testUSDT.approve(simpleAMM.target, liquidityAmountUSDT);

  await simpleAMM.addLiquidity(liquidityAmountDAI, liquidityAmountUSDT);
  console.log("Liquidity added to SimpleAMM \nIts ready to trade ......");
}

async function saveingAddresses() {
  saveContractAddresses({
    testDAI: testDAI.target,
    testUSDT: testUSDT.target,
    simpleAMM: simpleAMM.target
  });
}


function saveContractAddresses(addresses) {
  const filePath = 'deployedAddresses.json';
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  console.log('Contract addresses saved to deployedAddresses.json');
}


deployContract()
  .then(() => saveingAddresses())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
