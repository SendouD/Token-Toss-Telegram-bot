import { NextRequest, NextResponse } from 'next/server';
import {db} from "../../../../config/firebaseconfig";
import {collection, getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { decryptPayload } from '../../../../../utils/decryptPayload';
import { Connection, Transaction, clusterApiUrl } from '@solana/web3.js';
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
      return NextResponse.json({ status: 'OK', data:TransactionData.signature });

    }
    else{
      console.log('User not found in Firebase.');
  
    }
  
  
    return NextResponse.json({ status: 'NOT OK'});
  }
  