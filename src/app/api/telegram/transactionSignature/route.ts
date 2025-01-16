// src/app/api/telegram/transactionSignature/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/config/firebaseconfig";
import { collection, doc, getDoc } from "firebase/firestore";
import bs58 from 'bs58';
import { decryptPayload } from '../../../../../utils/decryptPayload';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
        const { username, data, nonce } = body;
        
        if (!username || !data || !nonce) {
            return NextResponse.json(
                { status: 'NOT OK', error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log('Data:', data);
        console.log('Nonce:', nonce);
    
        const usersCollection = collection(db, "users");
        const userDocRef = doc(usersCollection, username);
        const userDoc = await getDoc(userDocRef);
    
        if (!userDoc.exists()) {
            console.log('User not found in Firebase.');
            return NextResponse.json(
                { status: 'NOT OK', error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userDoc.data();
        const sharedSecret = bs58.decode(user.sharedSecret);
        const transactionData = decryptPayload(data, nonce, sharedSecret);
        
        console.log('Signature Data:', transactionData.signature);
        
        if (!transactionData.signature) {
            return NextResponse.json(
                { status: 'NOT OK', error: 'No signature found in decrypted data' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            status: 'OK',
            data: transactionData.signature
        });

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { status: 'NOT OK', error: 'Internal server error' },
            { status: 500 }
        );
    }
}