// Import necessary libraries and modules
import { Wallet, Contract } from 'ethers';
import { JsonRpcProvider } from 'ethers/providers';
import { parseUnits } from 'ethers';
import web3 from 'web3'; // Import web3
import { contractABI } from './contractABI.js'; // Import the contract ABI

//The purpose of this script is to assist users in executing transactions with a lower gas amount than usual. 
//For this script to work, the user needs to have the exact amount of tokens they want to burn in their wallet.
//For example, if a user wants to burn 4 batches (10,000,000 XEN tokens) and they have 10,000,001 XEN tokens, 
//the memory storage keys will not be generated in the correct order, and the transaction will be executed without 
//providing the user with a discount.

async function sendTransactionWithAccessList(privateKey) {
  //Define the node URL for the Ethereum provider. This depends on the network you want to connect to.
  const nodeUrl = 'https://rpc-mainnet.maticvigil.com';

  //Create a provider using the node URL and a wallet using a private key
  const provider = new JsonRpcProvider(nodeUrl);
  const wallet = new Wallet(privateKey, provider);

  //Create a web3 instance using the same node URL
  const web3Instance = new web3(nodeUrl);

  //Define the contract address. This depends on the specific contract you want to interact with and the network.
  //DBXen contract address
  let contractAddress = "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462";

  //The number of batches you want to burn.
  //Make sure that you have approved this number of batches before running the script!
  let batchNumber = 1;

  // Encode the function signature and parameters for the transaction
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

  // Create a contract instance using the contract address and ABI
  const deb0xContract = new Contract(contractAddress, contractABI, wallet);

  //Define the value sent to the contract, in this case, 0.05 ETH (expressed in units)
  //This value is directly influenced by the number of batches, the current gas price, and the transaction's gas limit. 
  //To set this value as precisely as possible, the application's frontend can be used, and the first parameter can be replaced with the suggested value from the frontend.
  const protocol_fee = parseUnits("0.05", "ether");

  //Send a transaction to the 'deb0xContract' for the 'burnBatch' function with the 'batchNumber' parameter.
  //Specify 'value' (the value sent), 'type' (transaction type), 'gasLimit' (gas limit), and 'accessList' (access list).
  const txResponse = await deb0xContract["burnBatch(uint256)"](batchNumber, {
    value: protocol_fee,  // The value sent in the transaction
    type: 1,             // Transaction type
    gasLimit: 350000,    // Gas limit
    accessList: accessList // Access list
  });

  //Wait for the transaction to be confirmed and obtain a transaction receipt
  const receipt = await txResponse.wait();

  //Display information about the transaction receipt
  console.log('Transaction Receipt:', receipt);
}

// Define your private key
const privateKey = 'Your_private_key';

// Call the sendTransactionWithAccessList function with the private key
// This example is for the Polygon network.
// If you want to use this script on a different network, modify the RPC URL and contract address.
sendTransactionWithAccessList(privateKey);
