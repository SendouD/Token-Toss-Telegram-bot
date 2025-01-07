import { NextRequest, NextResponse } from 'next/server';
import {db} from "../../../../config/firebaseconfig";
import {collection, getFirestore, doc, setDoc, getDoc} from "firebase/firestore";
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { decryptPayload } from '../../../../../utils/decryptPayload';



export async function POST(req: NextRequest) {
  const body = await req.json();
  const {username, data, nonce, phantom_encryption_public_key, urlParams} = body;
  console.log('URL Params:', urlParams);

  const usersCollection = collection(db,"users");
  const userDocRef = doc(usersCollection, username);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const user = userDoc.data();
    const kp_publickey=user.dappKeyPair.publicKey;
    const kp_privatekey=user.dappKeyPair.secretKey;
    const kp_pk=bs58.decode(kp_publickey);
    const kp_sk=bs58.decode(kp_privatekey);
    const sharedSecretDapp = nacl.box.before(
        bs58.decode(phantom_encryption_public_key),
        kp_sk
      );
      const connectData=decryptPayload(data,nonce,sharedSecretDapp);
      const sessionId=connectData.session;
      const publicKey=connectData.public_key;
      const sharedSecretBase58 = bs58.encode(sharedSecretDapp);

      await setDoc(userDocRef, {
        sessionId: sessionId,
        publicKey: publicKey,
        nonce: nonce,
        data: data,
        sharedSecret: sharedSecretBase58
      }, { merge: true });
      console.log('Public key and session ID saved to Firebase.');

  }
  else{
    console.log('User not found in Firebase.');

  }

  return NextResponse.json({ status: 'OK' });
}
