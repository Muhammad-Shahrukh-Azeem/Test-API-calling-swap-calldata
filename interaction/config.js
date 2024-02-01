const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('http://localhost:8545');

const signer = provider.getSigner(0);

async function constructSwapCallData(tokenIn, tokenOut, amountIn, userAddress) {
    // You need the ABI of the SimpleAMM contract
    const simpleAMM = new ethers.Contract(simpleAMMAddress, SimpleAMMAbi, signer);
  
    // Encode the function call
    return simpleAMM.interface.encodeFunctionData("swap", [userAddress, tokenIn, amountIn]);
  }
  