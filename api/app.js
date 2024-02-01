const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/swap', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, userAddress } = req.body;
    const callData = await constructSwapCallData(tokenIn, tokenOut, amountIn, userAddress);
    const txResponse = await sendSwapTransaction(callData);
    const receipt = await txResponse.wait();
    
    res.json({ txHash: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
