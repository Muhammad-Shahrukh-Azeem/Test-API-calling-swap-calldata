const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const https = require("https");
const path = require('path');

require('dotenv').config();

const apiKey = process.env.API;

const downloadImage = (url, path, callback) => {
  https.get(url, (res) => {
    const fileStream = fs.createWriteStream(path);
    res.pipe(fileStream);
    fileStream.on("finish", () => {
      fileStream.close(callback);
    });
  });
};

const GettingImage = async (newPrompt) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImage({
    prompt: newPrompt,
    n: 4,
    size: "1024x1024",
  });
  return response.data;
}

const editImage = async (inputImagePath, maskImagePath) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImageEdit(
    fs.createReadStream(inputImagePath),
    fs.createReadStream(maskImagePath),
    "Add a subtle shadow to the Decypher Labs logo",
    2,
    "1024x1024",
  );
  return response.data;
}

const ImageVariation = async () => {
  const configuration = new Configuration({
    apiKey: process.env.API,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImageVariation(
    fs.createReadStream("A_Logo_called_Decypher_Labs_with_a_techy_look_and_its_for_a_web3_company_blockchain_company/image_4.png"),
    2,
    "1024x1024"
  );
  // console.log(response.data)
  return response.data;
}

const generationAndDownload = async (newPrompt) => {
  const data = await GettingImage(newPrompt);
  if (data && data.data) {
    const folderName = newPrompt.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    data.data.forEach((image, index) => {
      const imagePath = `${folderName}/image_${index + 1}.png`;
      downloadImage(image.url, imagePath, () => {
        console.log(`Image ${index + 1} saved to ${imagePath}`);
      });
    });
  } else {
    console.log('No images generated.');
  }
};


const VariationAndDownload = async (imagePath) => {
  const data = await ImageVariation(imagePath);
  if (data && data.data) {
    const imageName = path.basename(imagePath, '.png');
    const parentDirectory = path.dirname(imagePath);
    const folderName = `Variation_of_${imageName}`;

    const newFolderPath = path.join(parentDirectory, folderName);

    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath);
    }

    data.data.forEach((image, index) => {
      const newImagePath = path.join(newFolderPath, `image_${index + 1}.png`);
      downloadImage(image.url, newImagePath, () => {
        console.log(`Image ${index + 1} saved to ${newImagePath}`);
      });
    });
  } else {
    console.log('No images generated.');
  }
};



generationAndDownload( "A Logo called Decypher Labs with a techy look and its for a web3 company blockchain company");

VariationAndDownload('A_Logo_called_Decypher_Labs_with_a_techy_look_and_its_for_a_web3_company_blockchain_company/image_1.png')
