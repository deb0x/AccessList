// Import necessary libraries and modules
import { Wallet, Contract } from 'ethers';
import { JsonRpcProvider } from 'ethers/providers';
import { parseUnits } from "ethers";
import web3 from 'web3'; // Import web3
import { contractABI } from './contractABI.js'; // Import the contract ABI
import axios from 'axios';

//The current values are configured for the Polygon Netwrok!
//The purpose of this script is to assist users in executing EIP-2930 "Access List" transactions on EVM compatible blockchains that support EIP-2930. 
//For this script to work, the user needs to have the exact amount of tokens they want to burn in their wallet.
//For example, if a user wants to burn 4 batches (10,000,000 XEN tokens) and they have 10,000,001 XEN tokens, 
//the memory storage keys will not be generated in the correct order, and the transaction will be executed without offering the user a discount.

async function sendTransactionWithAccessList(privateKey) {
  //Define the node URL for the provider. This depends on the network you want to connect to.
  //Ethereum: https://mainnet.infura.io/v3/your_infura_key (another rpc can be used)
  //Pulse: https://rpc.pulsechain.com (another rpc can be used)
  const nodeUrl = "https://polygon-pokt.nodies.app";

  // Create a provider using the node URL and a wallet using a private key
  const provider = new JsonRpcProvider(nodeUrl);
  const wallet = new Wallet(privateKey, provider);

  //Create a web3 instance using the same node URL
  const web3Instance = new web3(nodeUrl);

  //Define the contract address. This depends on the specific contract you want to interact with and the network.
  //DBXen contract address
  //Ethereum: 0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD
  //Pulse: 0x6d38Ab9f5b5Edfb22e57a44c3c747f9584de1f1a
  let contractAddress = "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462";

  //The number of batches you want to burn.
  //Make sure that you have approved this number of batches before running the script!
  let batchNumber = 1;

  //Encode the function signature and parameters for the transaction
  const functionSignature = web3Instance.eth.abi.encodeFunctionSignature({
    name: 'burnBatch',
    type: 'function',
    inputs: [
      {
        name: 'batchNumber',
        type: 'uint256',
      },
    ],
  });

  //Encode the function parameters, specifying 'uint256' type for the 'batchNumber'
  const encodedParameters = web3Instance.eth.abi.encodeParameters(['uint256'], [batchNumber]);

  //Combine the function signature and encoded parameters into a single hexadecimal string
  const dataInHEX = functionSignature + encodedParameters.substring(2);

  //Create an access list for the transaction with the following parameters:  
  let accessListResult = await web3Instance.eth.createAccessList({
    from: wallet.address,  // The sender's address for the transaction
    data: dataInHEX,       // The data for the transaction in hexadecimal format
    gas: '0x3d0900',       // The gas limit for the transaction
    to: contractAddress    // The address of the smart contract
  });

  //Extract the access list from the result
  let accessList = accessListResult.accessList;
  console.log("Access list: ")
  console.log(accessList)
  //Create a contract instance using the contract address and ABI
  const dbxenContract = new Contract(contractAddress, contractABI, wallet);

  //Define the value sent to the contract
  //This value is directly influenced by the number of batches, the current gas price, and the transaction's gas limit. 
  //To set this value as precisely as possible, the application's frontend can be used, and the first parameter can be replaced with the suggested value from the frontend.
  //Price URL: 
  //Ethereum: https://mainnet.infura.io/v3/your_infura_key (another rpc can be used)
  //Pulse: https://rpc.pulsechain.com (another rpc can be used)
  let priceURL = "https://polygon-pokt.nodies.app";
  let method = 'POST';
  const options = {
      method: method,
      url: priceURL,
      port: 443,
      headers: {
          'Content-Type': 'application/json'
      },
      data: JSON.stringify({
          "jsonrpc": "2.0", "method": "eth_gasPrice", "params": [], "id": 1
      })
  };

  //Make an HTTP request to get the gas price
  await axios.request(options).then(async (result) => {
    //Extract the gas price from the response
    let price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));

    //Calculate the protocol fee
    let protocol_fee = batchNumber * (1 - 0.00005 * batchNumber);

    //Set a fixed gas limit value
    let gasLimitVal = 300000;

    //Calculate the fee for the transaction
    //For PulseChain:     
    //let fee = gasLimitVal * price * 300 * protocol_fee / 1000000000;
    //For Polygon and Ethereum:
    let fee = gasLimitVal * price * protocol_fee / 1000000000;
    //Send a transaction to the 'DBXen' contract for the 'burnBatch' function with the 'batchNumber' parameter.
    //Specify 'value' (the value sent), 'type' (transaction type), 'gasLimit' (gas limit), and 'accessList' (access list).
    const txResponse = await dbxenContract["burnBatch(uint256)"](batchNumber, {
      value: parseUnits(fee.toString(), "ether"), // The value sent in the transaction
      type: 1,             // Transaction type
      gasLimit: 350000,    // Gas limit
      accessList: accessList // Access list
    });
    // Wait for the transaction to be confirmed and obtain a transaction receipt
    const receipt = await txResponse.wait();

    // Display information about the transaction receipt
    console.log('Transaction Receipt:')
    console.log(receipt);
  });
}

// Define your private key
const privateKey = "your_private_key";


// Call the sendTransactionWithAccessList function with the private key
// If you want to use this script on a different network, modify the RPC URL and contract address.
sendTransactionWithAccessList(privateKey);
