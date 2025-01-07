'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import { Keypair, Transaction, SystemProgram, Connection, PublicKey } from '@solana/web3.js';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId="cm5cm75t609clhxi1ai83vce4"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
            walletChainType: 'solana-only',
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'off',
        },
        loginMethods: ['telegram'], 
        solanaClusters: [{name: 'devnet', rpcUrl: 'https://api.devnet.solana.com'}],
        

      }}
    >
      {children}
    </PrivyProvider>
  );
}