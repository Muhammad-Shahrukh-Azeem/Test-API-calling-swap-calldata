const axios = require('axios');
const fs = require('fs');

function getDeployedAddresses() {
    const data = fs.readFileSync('deployedAddresses.json', { encoding: 'utf8' });
    return JSON.parse(data);
  }
  
const deployedAddresses = getDeployedAddresses();

async function makeSwap() {
  try {
    const response = await axios.post('http://localhost:3000/swap', {
      tokenIn: deployedAddresses.testDAI,
      amountIn: '10'
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error making swap request:', error.response.data);
  }
}

makeSwap();
