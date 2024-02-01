const express = require('express');
const app = express();
app.use(express.json());
const { performSwap } = require('../interaction/config');
const port = 3000;

app.get('/', (req, res) => {
  res.send('The is Aggregator API executing call data!');
});

app.post('/swap', async (req, res) => {
  try {
      const { tokenIn, amountIn } = req.body;
      await performSwap(tokenIn, ethers.parseUnits(amountIn, 18));
      res.send("Swap executed successfully");
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during the swap');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
