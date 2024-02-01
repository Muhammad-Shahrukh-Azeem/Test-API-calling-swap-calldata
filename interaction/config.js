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

async function performSwap(tokenIn, amountIn) {

  //THE PRIVATE KEY IS BEING FETCHED FROM HARTHATTTTTTTTTTTTTTTTT

  const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)

  const nonce = await provider.getTransactionCount(signer.address);

  const testDAI = new ethers.Contract(deployedAddresses.testDAI, TestDAI.abi, signer);
  const testUSDT = new ethers.Contract(deployedAddresses.testUSDT, TestUSDT.abi, signer);
  const simpleAMM = new ethers.Contract(deployedAddresses.simpleAMM, SimpleAMM.abi, signer);

  const tokenContract = tokenIn === deployedAddresses.testDAI ? testDAI : testUSDT;

  const app = await tokenContract.approve(simpleAMM.target, amountIn, { nonce: nonce });

  app.wait()

  const swapTx = await simpleAMM.swap(signer.getAddress(), tokenIn, amountIn, { gasLimit: 1000000, nonce: nonce + 1 });
  const receipt = await swapTx.wait();

  console.log(`Swap transaction successful: ${receipt.transactionHash}`);
}

module.exports = {
  performSwap
}