import { Keypair, Transaction, SystemProgram, Connection, PublicKey } from '@solana/web3.js';
async function main() {
  const connection = new Connection('https://api.devnet.solana.com'); // You can use a different network URL

// Example: Use a generated keypair (replace with actual user wallet address)
const feePayerKeypair = Keypair.generate(); // Replace with the fee payer's keypair if you have one

const recipientAddress = new PublicKey('fayM2qrQyQYjd2eD9Qq7dc9c1cV1mBNea73WE51pCwS'); // Replace with the recipient's address

// Create a transaction object to transfer 0.1 SOL
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: feePayerKeypair.publicKey,
    toPubkey: recipientAddress as PublicKey,
    lamports: 100000000, // 0.1 SOL in lamports (1 SOL = 1 billion lamports)
  })
);

// Fetch the recent blockhash
const { blockhash } = await connection.getRecentBlockhash();

// Set the transaction's recent blockhash and fee payer
transaction.recentBlockhash = blockhash;
transaction.feePayer = feePayerKeypair.publicKey;


// Serialize the transaction and sign it using Privy (with the walletId from Privy)
// Sign the transaction using the fee payer's keypair
transaction.sign(feePayerKeypair);

// Serialize the signed transaction
const signedTransaction = transaction.serialize();

console.log('Signed Transaction:', signedTransaction.toString('base64'));}

main().catch(console.error);
