import { NextRequest, NextResponse } from 'next/server';
import {db} from "../../../../config/firebaseconfig";
import {collection, getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { decryptPayload } from '../../../../../utils/decryptPayload';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';




export async function POST(req: NextRequest) {
  const body = await req.json();
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const {username, data, nonce } = body;
  console.log('Data:', data);
  console.log('Nonce:', nonce);

  const usersCollection = collection(db,"users");
  const userDocRef = doc(usersCollection, username);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const user = userDoc.data();
    const sharedSecret=bs58.decode(user.sharedSecret);
    const TransactionData=decryptPayload(data,nonce,sharedSecret);
    console.log('Signature Data:', TransactionData.signature);
    const transaction = await connection.getTransaction(TransactionData.signature);
   
  
    if (transaction) {
      const accountKeys = transaction.transaction.message.accountKeys.map(pubKey => pubKey.toBase58());  
      // Loop through each instruction in the transaction
      transaction.transaction.message.instructions.forEach(async (instruction, index) => {
        const programId = accountKeys[instruction.programIdIndex];
        // Check for Token-2022 Program ID
        if (programId === splToken.TOKEN_2022_PROGRAM_ID.toBase58()) {
  
          // Assuming the mint address is the first account in the InitializeMint instruction
          const mintAddress = accountKeys[instruction.accounts[0]];
          console.log('Token Mint Address:', mintAddress);
          try{
          await updateDoc(userDocRef, {
            "Tokens-created": arrayUnion(mintAddress),
          });
  
          console.log('Token mint address added to Firebase.');}
          catch(error){
            console.log('ErrorUplaoding document',error);
          }
        }
      });
    } else {
      console.log('Transaction not found.');
    }
      // await setDoc(userDocRef, {
      //   signature: TransactionData.signature
      // }, { merge: true });
      // console.log('Public key and session ID saved to Firebase.');

  }
  else{
    console.log('User not found in Firebase.');

  }


  return NextResponse.json({ status: 'OK' });
}
