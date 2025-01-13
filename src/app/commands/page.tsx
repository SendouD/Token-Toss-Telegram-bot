import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from '@/components/Header';
import { Separator } from '@radix-ui/react-separator';
const Commands = () => {
    const botCommands = [
        { command: '/balance', description: 'Fetches your Privy Solana wallet balance&#39;' },
        { command: '/connect', description: 'Initiates a Phantom wallet connection using a deeplink and stores the encryption key pair in Firestore&#39;' },
        { command: '/airdrop', description: 'Sends a Native devnet SOL airdrop to you&#39;' },
        { command: '/createtoken', description: 'Initiates token creation using token metadata and images, storing it on IPFS&#39;' },
        { command: '/airdropuser', description: 'Airdrop tokens to other users&#39;' },
        { command: '/sendsol <amount>', description: 'Sends SOL to a replied user using Privy to manage wallets&#39;' },

    ];

    return (
        <div className="min-h-screen dark bg-background pixel-pattern">
            <Header />
            <main className="container px-4 py-8 mx-auto">
                <Card className="w-full max-w-4xl mx-auto bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center text-foreground pixel-text">
                            Token Toss Bot Setup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground pixel-text">Important Information</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pixel-text">
                                <li>You should login to use the bot&#39;s features, but receivers may not need to login initially.</li>
                                <li>Pre-generated wallets will be created for receivers, and they can login later to access their wallet&#39;s private key.</li>
                                <li>Private keys are stored using sharding, ensuring complete decentralization.</li>
                                <li>To start using the bot in Telegram, you must first use the /connect command.</li>
                            </ul>
                        </div>

                        <Separator className="my-6 bg-purple-500" />

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground pixel-text">Bot Commands</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {botCommands.map((cmd, index) => (
                                    <Card key={index} className="bg-card/30 border border-purple-500 pixel-borders">
                                        <CardContent className="p-4">
                                            <p className="font-bold text-foreground pixel-text">{cmd.command}</p>
                                            <p className="text-sm text-muted-foreground pixel-text">{cmd.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Commands;

