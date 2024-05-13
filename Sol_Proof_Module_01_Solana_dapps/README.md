## Introduction To Solana Dapps Objectives
Implement the functionality for the "Create a new Solana account" button to generate a new KeyPair on the backend and airdrop 2 SOL to the newly created KeyPair. Subsequently, set up the functionality for the following button labeled "Connect to Phantom Wallet" to establish a connection with the Phantom Wallet if it's available. Finally, develop the functionality for the "Transfer SOL to New Wallet" button, which should initiate a transfer of 1 SOL (originally airdropped into the account generated in step 1) to the account connected in Step 2. Whether you choose to place all three buttons on a single page or across different pages is at your discretion. While a sophisticated design is not obligatory, prioritizing functionality is paramount.

## Functionality Code Review 

```javascript
const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
  
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const walletBalance = await connection.getBalance(
          new PublicKey(response.publicKey.toString())
        );
        setWalletBalance(walletBalance);

      } catch (err) {
        const errorCode = { code: 4001, message: 'User rejected the request.' }
        console.log(errorCode, err);
      }
    }
  };

  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.disconnect();
        setWalletKey(undefined);
      } catch (err) {

      }
    }
  };

  const createWallet = () => {
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const newPair = new Keypair();
        const publicKey = new PublicKey(newPair.publicKey).toString();
        const privateKey = newPair.secretKey;
        setUserWallet(publicKey);
        setUserPrivateKey(privateKey);
      } catch (err) {

      }
    }
  };

  const airdropSol = async () => {
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const myWallet = await Keypair.fromSecretKey(userPrivateKey);
        console.log("Airdropping some SOL to my wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
          new PublicKey(userWallet),
          2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);
        setAirdropped(true);
        userWalletBalance2();
      } catch (err) {

      }
    }
  };

  const userWalletBalance2 = async () => {
    //@ts-ignore
    const { solana } = window;
    if (solana) {

      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const walletBalance = await connection.getBalance(
        new PublicKey(userWallet)
      );
      setUserWalletBalance(walletBalance)
    }
  };

  const transferSol = async () => {
    if (walletKey) {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const from = Keypair.fromSecretKey(userPrivateKey);
      const to = new PublicKey((walletKey));
      const lamportsToSend = 1.9 * LAMPORTS_PER_SOL;
      var transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: lamportsToSend,

        })
      );
```
A application establishes essential functionality for a web application interacting with the Solana blockchain. It includes functions to connect to a Solana wallet, create a new wallet, perform SOL airdrops, check wallet balances, and initiate SOL transfers

**connectWallet:** This function attempts to connect to a Solana wallet. It checks if the solana object is available in the window. If available, it connects to the wallet, retrieves the wallet account's public key, sets it as walletKey, fetches the wallet balance, and sets it as walletBalance. If an error occurs during the process, it logs an error.
**disconnectWallet:** This function attempts to disconnect from the Solana wallet. Similar to connectWallet, it checks if the solana object is available, then disconnects from the wallet. Upon successful disconnection, it sets walletKey to undefined.
**createWallet:** This function creates a new Solana wallet. It generates a new key pair using Keypair, gets the public key as publicKey, and the private key as privateKey. Then, it sets these values as userWallet and userPrivateKey, respectively.
**airdropSol:** This function performs an airdrop of SOL (Solana's native token) to the user's wallet. It first checks if the solana object is available. Then, it fetches the user's wallet using the private key stored earlier, requests an airdrop of 2 SOL to that wallet, confirms the transaction, and updates the state to indicate that the airdrop was successful.
**userWalletBalance2:** This function fetches the balance of the user's wallet. It retrieves the wallet balance using the user's public key (userWallet) and updates the state with the fetched balance.
**transferSol:** This function initiates a transfer of SOL from the user's wallet to another wallet (walletKey). It constructs a transaction using Transaction and SystemProgram.transfer(), specifying the sender's public key (from.publicKey), the recipient's public key (to), and the amount of SOL to transfer (lamportsToSend).

## What do Airdrops mean?
Airdrops refer to the distribution of cryptocurrency tokens or assets to multiple wallet addresses, typically for free or as part of a promotional campaign. Unlike traditional methods of distributing tokens, such as mining or purchasing, airdrops are usually conducted by projects or organizations looking to increase awareness, incentivize participation, or reward existing users. Airdrops can occur on various blockchain platforms and are often used to bootstrap communities, distribute governance tokens, or introduce new features. Recipients of airdropped tokens may receive them directly into their wallet addresses without any prior action required, or they may need to fulfill certain criteria, such as holding a specific token or participating in a project's activities.

## Installation Guide
To install the application, begin by cloning the repository using the provided URL in your terminal. After cloning, navigate to the project directory and install dependencies by running "npm install". Once the dependencies are installed, start the development server with "npm run dev". Access the application locally by typing "http://localhost:3000" into your web browser's address bar. This will load the application, allowing you to explore its features and functionalities.





