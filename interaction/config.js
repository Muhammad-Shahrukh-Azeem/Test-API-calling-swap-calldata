const { ethers } = require('ethers');
const fs = require('fs');
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

const TestDAI = require('../artifacts/contracts/TestDAI.sol/TestDAI.json');
const TestUSDT = require('../artifacts/contracts/TestUSDT.sol/TestUSDT.json');
const SimpleAMM = require('../artifacts/contracts/SimpleAMM.sol/SimpleAMM.json');

function getDeployedAddresses() {
  const data = fs.readFileSync('deployedAddresses.json', { encoding: 'utf8' });
  return JSON.parse(data);
}

const deployedAddresses = getDeployedAddresses();

async function performSwap(tokenIn, amountin) {

  const amountIn = ethers.parseUnits(amountin, 18)

  //THE PRIVATE KEY IS BEING FETCHED FROM HARTHATTTTTTTTTTTTTTTTT

  const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)
  const userAddress = await signer.getAddress();

  const nonce = await provider.getTransactionCount(signer.address);

  const testDAI = new ethers.Contract(deployedAddresses.testDAI, TestDAI.abi, signer);
  const testUSDT = new ethers.Contract(deployedAddresses.testUSDT, TestUSDT.abi, signer);
  const simpleAMM = new ethers.Contract(deployedAddresses.simpleAMM, SimpleAMM.abi, signer);

  const tokenContract = tokenIn === deployedAddresses.testDAI ? testDAI : testUSDT;

  const app = await tokenContract.approve(simpleAMM.target, amountIn, { nonce: nonce });

  app.wait()

  // const swapTx = await simpleAMM.swap(signer.getAddress(), tokenIn, amountIn, { gasLimit: 1000000, nonce: nonce + 1 });
  // const receipt = await swapTx.wait();

  const swapCallData = simpleAMM.interface.encodeFunctionData("swap", [userAddress, tokenIn, amountIn]);

  const calls = [{
    origin: userAddress,
    target: simpleAMM.target,
    data: swapCallData
  }];
  try {
    const executeTx = await simpleAMM.execute(calls);
    const receipt = await executeTx.wait();
    // console.log("Swap execution successful:", JSON.stringify(receipt, null, 2));
    console.log(`Swap execution successful: ${receipt.hash}`);

    return receipt.hash;


  } catch (error) {
    console.error("Error during transaction execution:", error);
  }
  
}

// performSwap(deployedAddresses.testDAI, ethers.parseUnits("10", 18))

module.exports = {
  performSwap
}