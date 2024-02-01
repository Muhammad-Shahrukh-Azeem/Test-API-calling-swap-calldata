# Test Project

This project the use of api in calling swap aggregator from a text contract. 
This calls execte function with calldata via an api

# To run

1. Open Terminal in root directory

```shell
npm install
npm run dev
```

This will set up nodemon which will run the api and hardhat node cocurrently.

2. Next in another terminal in the root directory type

```shell
npx hardhat test
npx hardhat run scripts/deploy.js --network localhost
```
This will deploy testUSDT and testDAI in the hardhat local node
Then you can call the test swap api in api/app.js

3. You can run the example script via 

```shell
node api/exampleHitAPI.js
```
