A script to execute the burn batch function using an access list.

### Prerequisites
* npm 8.9+
* node v16.20+

### Steps to run the script

1. `npm install ethers` in root dir
2. `npm install web3` in root dir
3.  Add "type": "module" in your package.json
This is how it should look!
```
{
  "type": "module",
  "dependencies": {
    "ethers": "^6.8.0",
    "web3": "^4.2.1"
  }
}
```

4. Add the private key to the script.
5. `node AccessList.mjs`
