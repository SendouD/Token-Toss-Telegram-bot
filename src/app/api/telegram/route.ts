import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { PrivyClient } from '@privy-io/server-auth';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { collection, getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseconfig";
import { sendAirdrop } from '../../../../utils/Solana/airdrop';
import { Transfer } from '../../../../utils/Solana/transfer';
import { pinata } from '../../../../utils/pinataconfig';
import fetch from 'node-fetch'; // Ensure node-fetch is installed if using Node.js
import axios from 'axios';
import { uploadFiletoIPFS } from '../../../../utils/IPFS/file';
import { uploadMetadataToIPFS } from '../../../../utils/IPFS/Metadata';
import { createMint } from '../../../../utils/Solana/createtoken';
import createPreWallet from '../../../../utils/Pre-generatedwallet/createwallet';
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { getUserTokens } from '../../../../utils/Solana/getUserTokens';
import { mintTo } from '../../../../utils/Solana/tokenMint';
const privy_app_id = process.env.PRIVY_APP_ID;
const privy_secret = process.env.PRIVY_SECRET;
// if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_SECRET) {
//   throw new Error('Privy environment variables are not set');
// }
const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET!);

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Initialize the bot without polling
const token = process.env.TELEGRAM_BOT_TOKEN;;
const bot = new TelegramBot(token!, { webHook: true });

async function getWalletBalance(address: string) {
  try {
    // console.log('Fetching balance for Solana address:', address);
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch balance: ${error.message}`);
    } else {
      throw new Error('Failed to fetch balance: Unknown error');
    }
  }
}



bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot! Use /balance to check your wallet balance.');
    return;
  }
  else if (msg.text === '/address') {
    if (msg.from && msg.from.username) {
      try {
        const user = await privy.getUserByTelegramUsername(msg.from.username);
        const walletAddress = user?.wallet?.address;

        if (walletAddress) {
          bot.sendMessage(chatId, `Your Wallet Address is: ${walletAddress}`);
        } else {
          bot.sendMessage(chatId, 'Error: No wallet address found.');
        }
      } catch (error) {
        console.error("Error fetching user or storing in Firestore:", error);
        bot.sendMessage(chatId, 'Error: Unable to fetch wallet address.');
      }
    } else {
      bot.sendMessage(chatId, 'Error: Unable to authenticate.');
    }
    return;
  }
  else if (msg.text === '/balance') {
    try {
      if (!msg.from?.username) {
        bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
        return;
      }

      // Get user's wallet info from Privy
      const user = await privy.getUserByTelegramUsername(msg.from.username);
      // console.log('Retrieved user wallet:', user?.wallet);

      if (!user?.wallet?.address) {
        bot.sendMessage(chatId, 'Error: No wallet address found for your account.');
        return;
      }
      const balance = await getWalletBalance(user.wallet.address);
      bot.sendMessage(
        chatId,
        `💰 Wallet Balance (Solana Devnet)\n\n` +
        `Address: ${user.wallet.address}\n` +
        `Balance: ${balance.toFixed(4)} SOL\n` +
        `Network: Devnet`
      );
    } catch (error) {
      console.error('Error fetching balance:', error);
      const errorMessage = (error as Error).message;
      bot.sendMessage(chatId, `Error: Unable to fetch balance. ${errorMessage}`);
    }
    return;
  }
  else if (msg.text === '/connect') {

    try {
      // Initiate a new connection to Phantom
      const dappKeyPair = nacl.box.keyPair();
      const appUrl = `${process.env.REDIRECT_URL}/api/telegram`;
      const redirectLink = `${process.env.REDIRECT_URL}/connect` || "https://default-redirect-url.com"; // Your actual redirect link
  
      // Construct the Phantom deeplink URL
      const connectUrl = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(appUrl)}&dapp_encryption_public_key=${bs58.encode(dappKeyPair.publicKey)}&redirect_link=${encodeURIComponent(redirectLink)}&cluster=devnet`;
  
      // Store the keypair in Firestore
      if (msg.from && msg.from.username) {
        const usersRef = collection(db, "users");
        const userDoc = doc(usersRef, msg.from.username);
        
        // Prepare the new data for the document
        const newData = {
          username: msg.from.username,
          dappKeyPair: {
            publicKey: bs58.encode(dappKeyPair.publicKey),
            secretKey: bs58.encode(dappKeyPair.secretKey) // WARNING: Store securely! Consider encrypting this.
          },
          chatId: chatId,
          createdAt: new Date().toISOString(),
        };
  
        // Merge the new data with existing document fields
        await setDoc(userDoc, newData, { merge: true });
  
        // Send the Phantom connect deeplink to the user
        const button = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Connect",
                  url: connectUrl
                }
              ]
            ]
          }
        };
        bot.sendMessage(chatId, `Please connect your Phantom wallet:`, button);
      } else {
        bot.sendMessage(chatId, 'Error: Unable to authenticate.');
      }
    } catch (error) {
      console.error("Error in connect command:", error);
      bot.sendMessage(chatId, 'Error: Failed to initiate Phantom connection.');
    }
    return;
  }
  
  else if (msg.text === '/airdrop') {
    try {
      if (msg.from?.username) {
        const transactionSignature = await sendAirdrop(msg.from.username);
        bot.sendMessage(chatId, `Airdrop signature:${transactionSignature}`);
      } else {
        bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
      }

    } catch (error) {
      console.error('Error sending airdrop:', error);
      bot.sendMessage(chatId, 'Error sending airdrop');
    }
    return;
  }
  else if(msg.text === '/transfer') {
    try {
      if (msg.from?.username) {
        const transactionSignature = await Transfer("J6JyErkGKzqHfTXcV17Ch4zF2Zgw7GpDvjeG1eoWqqSo", 0.1, msg.from.username);
        const button={
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Transfer",
                  url: transactionSignature
                }
              ]
            ]
          }
        }
        
        bot.sendMessage(chatId, `Transfer Transaction Link:`, button);
      } else {
        bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
      }
    } catch (error) {
      console.error('Error sending transfer:', error);
      bot.sendMessage(chatId, 'Error sending transfer');
    }
    return;
  }
 else if (msg.text === '/createtoken') {
      bot.sendMessage(chatId, 'Please provide the following details to create your token in the following format:\n\n' +
          'Name:<Token Name>\n' +
          'Symbol:<Token Symbol>\n' +
          'Description:<Token Description>\n\n' +
          'You can also send an image for your token.');
      
          const detailsRegex = /Name:(.+)\nSymbol:(.+)\nDescription:(.+)/i;
      
      bot.once('message', async (tokenMsg) => {
          try {
              if (tokenMsg.caption && tokenMsg.photo) {
                  const match = tokenMsg.caption.match(detailsRegex);
                  if (match) {
                      const tokenName = match[1].trim();
                      const tokenSymbol = match[2].trim();
                      const tokenDescription = match[3].trim();
                      const photo = tokenMsg.photo[tokenMsg.photo.length - 1];
                      const file = await bot.getFile(photo.file_id);
                      // console.log(file);
                      const ImageURL=await uploadFiletoIPFS(file);
                      const metadata = {
                        name: tokenName,
                        description: tokenDescription,
                        symbol: tokenSymbol,
                        image: ImageURL,
                      };



                      const metadataUrl = await uploadMetadataToIPFS(metadata);
                      if (msg.from?.username){

                      const {transactionURL, mintAddress} = await createMint(metadata, metadataUrl, msg.from?.username);
                      const button = {
                        reply_markup: {
                          inline_keyboard: [
                            [
                              {
                                text: "Create Token",
                                url: transactionURL
                              }
                            ],
                            [
                              {
                                text: "View on Solana Devnet",
                                url: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`
                              }
                            ]
                          ]
                        }
                      };
                      
                      // Send message with both buttons
                      bot.sendMessage(chatId, `Create Token Link:`, button);
                      }
                      else{
                        bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
                      }
                  }
              }
          } catch (error) {
              console.error('Error creating token:', error);
              bot.sendMessage(chatId, 'Error processing token creation request.');
          }
      });
      return;
  }
  else if(msg.text=='/airdropuser') {
    if (msg.reply_to_message && msg.reply_to_message.from) {
      const recipientUserId = msg.reply_to_message.from.id;
      const recipientUsername = msg.reply_to_message.from.username;
  
      if (recipientUsername) {
        // Fetch the user's tokens and show the token list
        await getUserTokens(msg);
      } else {
        bot.sendMessage(msg.chat.id, 'Please reply to a valid user.');
      }
    } else {
      bot.sendMessage(msg.chat.id, 'You must reply to a user to use this command.');
    }
    
  }
else if (msg.text && msg.text.startsWith('/sendsol')) {
  try {
      const parts = msg.text.split(' '); 
      if (parts.length === 2) {
          const amount = parts[1]; 

          if (msg.reply_to_message && msg.reply_to_message.from) {
              const recipientUserId = msg.reply_to_message.from.id;
              const recipientUsername = msg.reply_to_message.from.username;
             
  
             if (recipientUsername) {
                let privyUser = await privy.getUserByTelegramUsername(recipientUsername);

                if (!privyUser?.telegram?.username) {
                  try {
                    privyUser = (await createPreWallet(recipientUsername, recipientUserId.toString())) || null;
                    if (privyUser) {
                      // console.log(privyUser.wallet?.address);
                      try {
                        if (msg.from?.username) {
                          if (privyUser.wallet?.address) {
                            if (privyUser.wallet) {
                              const transactionSignature = await Transfer(
                              privyUser.wallet.address.toString(), 
                              parseFloat(amount), 
                              msg.from.username,
                              // `https://t.me/${msg.chat.username || ''}/${msg.message_id}` // Telegram chat deep link
                            );
                              const button={
                                reply_markup: {
                                  inline_keyboard: [
                                    [
                                      {
                                        text: "Transfer",
                                        url: transactionSignature
                                      }
                                    ]
                                  ]
                                }
                              }
                              bot.sendMessage(chatId, `Transfer Transaction Link:`, button);
                            } else {
                              bot.sendMessage(chatId, 'Error: Wallet address is undefined.');
                            }
                          } else {
                            throw new Error('Wallet address is undefined');
                          }
                        
                          
                        } else {
                          bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
                        }
                      } catch (error) {
                        console.error('Error sending transfer:', error);
                        bot.sendMessage(chatId, 'Error sending transfer.');}
                      
                    } else {
                      bot.sendMessage(chatId, 'Error: Unable to retrieve user wallet address.');
                    }
                  } catch (error) {
                    console.error('Error creating pre-wallet:', error);
                    bot.sendMessage(chatId, 'Error creating pre-wallet.');
                  }
                } 
                else{
                  if (msg.from?.username) {
                    const transactionSignature = await Transfer(privyUser.wallet!.address.toString(), parseFloat(amount), msg.from.username);
                    const button = {
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: "Transfer",
                              url: transactionSignature
                            }
                          ]
                        ]
                      }
                    };
                    bot.sendMessage(chatId, `Transfer Transaction Link:`, button);
                  } else {
                    bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
                  }
                }
                // console.log(privyUser?.wallet?.address);
              }
              // Proceed with your transaction logic, sending amount to recipientUserId
              bot.sendMessage(chatId, `Amount ${amount} will be sent to @${recipientUsername})`);


              // Here you can add further code to handle the transaction logic
          } else {
              bot.sendMessage(chatId, 'Please reply to the user you want to send the amount to.');
          }
      } else {
          bot.sendMessage(chatId, 'Invalid command format. Use /cpw send <amount> in reply to the recipient\'s message.');
      }
  } catch (error) {
      console.error('Error sending amount:', error);
      bot.sendMessage(chatId, 'Error processing your request.');
  }
  return;
}
else if(msg.text === '/link') {
  if (msg.from?.username) {
    bot.sendMessage(chatId, `${process.env.REDIRECT_URL}/login`|| "https://default-redirect-url.com");}
  
}
else if (msg.text === '/help') {
  bot.sendMessage(chatId, 'Available commands:\n\n' +
    '/start - Welcomes the user\n' +
    '/address - Retrieves and displays your wallet address from Privy\n' +
    '/balance - Fetches your Solana wallet balance\n' +
    '/connect - Initiates a Phantom wallet connection using a deeplink and stores the encryption key pair in Firestore\n' +
    '/airdrop - Sends a Solana token airdrop to you\n' +
    '/createtoken - Initiates token creation using token metadata and images, storing it on IPFS\n' +
    '/airdropuser - Airdrop tokens to other users\n' +
    '/sendsol <amount> - Sends SOL to a replied user using Privy to manage wallets');
  return;
}
// Handle token selection callback
bot.on('callback_query', async (query) => {
  try {
    if (!query.data?.startsWith('select_token_') || !query.from.id) return;

    const { data, message: callbackMessage } = query;
    const [_, __, index] = data.split('_');
    const mintAddress=index;

    // Assuming you're using Privy to get the recipient's wallet address
    const recipientUsername = callbackMessage?.reply_to_message?.from?.username;
    let recipientUserId=callbackMessage?.reply_to_message?.from?.id;

    if (!recipientUsername || !recipientUserId) return;

    if (recipientUsername) {
      let privyUser = await privy.getUserByTelegramUsername(recipientUsername);

      if (!privyUser?.telegram?.username) {
        try {
          privyUser = (await createPreWallet(recipientUsername, recipientUserId.toString())) || null;
          if (privyUser) {
            console.log(privyUser.wallet?.address);
            try {
              if (msg.from?.username) {
                if (privyUser.wallet?.address) {
                  if (privyUser.wallet) {
                    bot.sendMessage(chatId, `No  Link: ${privyUser.wallet.address}, ${mintAddress}`);

                  } else {
                    bot.sendMessage(chatId, 'Error: Wallet address is undefined.');
                  }
                } else {
                  throw new Error('Wallet address is undefined');
                }
              
                
              } else {
                bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
              }
            } catch (error) {
              console.error('Error sending transfer:', error);
              bot.sendMessage(chatId, 'Error sending transfer.');}
            
          } else {
            bot.sendMessage(chatId, 'Error: Unable to retrieve user wallet address.');
          }
        } catch (error) {
          console.error('Error creating pre-wallet:', error);
          bot.sendMessage(chatId, 'Error creating pre-wallet.');
        }
      } 
      else{
        if (msg.from?.username) {
          if (privyUser.wallet?.address) {
            const transactionURL = await mintTo(
                new PublicKey(mintAddress),
                new PublicKey(privyUser.wallet.address),
                1,
                msg.from.username
            );
        
            const walletAddress = privyUser.wallet.address;
            const mintAddr = mintAddress;
        
            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'View Transaction',
                                url: transactionURL // The transaction URL
                            }
                        ]
                    ]
                }
            };
        
            bot.sendMessage(chatId, `Airdrod To wallet: ${walletAddress}, Mint Address: ${mintAddr}`, opts);
        }
        
        else{
          bot.sendMessage(chatId,'wallet is not defined');
        }      
      }
         else {
          bot.sendMessage(chatId, 'Error: Unable to authenticate. Please set a Telegram username.');
        }
      }
    }

 


    



    await bot.answerCallbackQuery(query.id);

    // Confirm the selection
  } catch (error) {
    console.error('Error handling token selection:', error);
    if (query.message?.chat.id) {
      await bot.sendMessage(query.message.chat.id, 'Error processing your selection.');
    }
  }
});
});
// export async function POST(req: NextRequest) {
//   const body = await req.json();

//   // Log the incoming request body
//   console.log("Received data:", body);

//   bot.processUpdate(body);

//   return NextResponse.json({ status: 'OK' });
// }

export async function POST(req: NextRequest) {
  const body = await req.json();
  bot.processUpdate(body);
  return NextResponse.json({ status: 'OK' });
}

export async function OPTIONS() {
  return NextResponse.json({ status: 'OK' });
}