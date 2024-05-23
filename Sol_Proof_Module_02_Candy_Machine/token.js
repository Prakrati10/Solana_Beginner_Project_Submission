const {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer
} = require('@solana/spl-token');
const mpl = require('@metaplex-foundation/mpl-token-metadata');
const anchor = require('@project-serum/anchor');
const INITIALIZE = true;


(async () => {
    try {

        // Step 1: Connect to cluster and generate new Keypairs

        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const fromWallet = Keypair.generate();
        const toWallet = Keypair.generate();

        console.log("From Wallet Public Key:", fromWallet.publicKey.toBase58());
        console.log("To Wallet Public Key:", toWallet.publicKey.toBase58());

        // Step 2: Airdrop SOL into your from wallet

        const fromAirdropSignature = await connection.requestAirdrop(
            fromWallet.publicKey,
            LAMPORTS_PER_SOL
        );


        // Wait for airdrop confirmation
        await connection.confirmTransaction(fromAirdropSignature, 'confirmed');

        // Step 3: Create new token mint and get the token account of the fromWallet address


        const mint = await createMint(
            connection,
            fromWallet,
            fromWallet.publicKey,
            null,
            9
        );

        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );

        // Step 4: Mint a new token to the from account

        
        let signature = await mintTo(
            connection,
            fromWallet,
            mint,
            fromTokenAccount.address,
            fromWallet.publicKey,
            5000000000 // 5,000 tokens with 9 decimals
        );

        console.log("Mint transaction signature:", signature);
        console.log("Mint address is", mint.toString());

        // Step 5: Get the token account of the to-wallet address and if it does not exist, create it


        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            toWallet.publicKey
        );
        console.log(`To token account address is ${toTokenAccount.address.toBase58()}`);

        // Step 6: Transfer the new token to the to-wallet's token account that was just created

    
        signature = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            3000000000 // 3,000 tokens with 9 decimals
        );

        console.log("Transfer transaction signature:", signature);

        // Step 7: Metadata creation or update
        // Seeds and bump for finding program address


        const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
        const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
        const seed3 = Buffer.from(mint.toBytes());
        const [metadataPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);

        // Accounts object containing necessary account information

        const accounts = {
            metadata: metadataPDA,
            mint,
            mintAuthority: fromWallet.publicKey,
            payer: fromWallet.publicKey,
            updateAuthority: fromWallet.publicKey
        };

        // Data object for creating or updating metadata

        const dataV2 = {
            name: "Car_NFT",
            symbol: "BBW",
            uri: "https://gateway.pinata.cloud/ipfs/QmUmSaw3iYbNp8vhNbuiedKC3P1pLrDxnwmCKVz7aCwyfj",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
        };

        // Creating the instruction based on the INITIALIZE flag

        let instruction;
        if (INITIALIZE) {
            const args = {
                createMetadataAccountArgsV3: {
                    data: dataV2,
                    isMutable: true,
                    collectionDetails: null
                }
            };
            instruction = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
        } else {
            const args = {
                updateMetadataAccountArgsV2: {
                    data: dataV2,
                    isMutable: true,
                    updateAuthority: fromWallet.publicKey,
                    primarySaleHappened: true
                }
            };
            instruction = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);
        }

        // Creating a new transaction for metadata

        const tx = new Transaction();

        // Adding the instruction to the transaction

        tx.add(instruction);

        // Sending and confirming the transaction for metadata

        const txid = await sendAndConfirmTransaction(connection, tx, [fromWallet]);

        // Logging the transaction ID
        
        console.log("Metadata transaction ID:", txid);

    } catch (error) {
        console.error("Error in processing:", error);
    }
})();
