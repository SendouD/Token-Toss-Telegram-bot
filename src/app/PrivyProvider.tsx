'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import { Keypair, Transaction, SystemProgram, Connection, PublicKey } from '@solana/web3.js';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'default-app-id'}
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