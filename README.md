A script to execute the burn batch function using an access list.

### Prerequisites
* npm 8.9+
* node v16.20+

### Steps to run the script

1. `npm install ethers` in root dir
2. `npm install web3` in root dir
3. `npm install axios` in root dir
4.  Add "type": "module" in your package.json
This is how it should look!
```
{
  "type": "module",
  "dependencies": {
    "axios": "^1.6.0",
    "ethers": "^6.8.0",
    "web3": "^4.2.1"
  }
}
```

5. Add the private key to the script.
6. `node AccessList.mjs`
