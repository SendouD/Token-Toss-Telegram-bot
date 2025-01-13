'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy, Wallet, WalletWithMetadata } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WalletIcon, LogOut, Send, User, Key, Loader2, Copy, CheckCircle2, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
const Login = () => {
  const { login, authenticated, user, ready, logout } = usePrivy();
  const { createWallet, exportWallet } = useSolanaWallets();
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  let wallet: Wallet;
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const hasEmbeddedWallet = !!user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' &&
      account.walletClient === 'privy' &&
      account.chainType === 'solana',
  );

  const isAuthenticated = ready && authenticated;
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

  const fetchBalance = async (address: string) => {
    try {
      setLoading(true);
      const balanceInSOL = await getWalletBalance(address); // Convert lamports to SOL
      setBalance(balanceInSOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const handleExportWallet = () => {
    if (user?.wallet?.address) {
      exportWallet({ address: user.wallet.address });
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const setupWallet = async () => {
      if (authenticated && !user?.wallet?.address) {
        try {
          wallet = await createWallet();
        } catch (error) {
          console.error('Error creating wallet:', error);
          toast.error('Failed to create wallet');
        }
      } else if (authenticated && user?.wallet?.address) {
        wallet = user.wallet;
        fetchBalance(user.wallet.address);
      }
    };

    if (authenticated) {
      setupWallet();
    }
  }, [authenticated, createWallet, user]);

  if (!ready) {
    return (
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 bg-background pixel-pattern"
    >
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center bg-background pixel-pattern"
      >
        <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-purple-400/20" />
              <Skeleton className="h-4 w-3/4 bg-purple-400/20" />
              <Skeleton className="h-10 w-full bg-purple-400/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>
    );
  }

  if (ready && !authenticated) {
    return (
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 bg-background pixel-pattern"
    >
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center p-4 bg-background pixel-pattern"
      >
        <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-foreground pixel-text">
                <WalletIcon className="h-6 w-6 text-purple-400" />
                Connect Wallet
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground mt-2 pixel-text">
                Login to access your blockchain wallet
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 hover:scale-105 pixel-borders pixel-text"
                onClick={() => login({ loginMethods: ['telegram'] })}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701l-.335 5.099c.492 0 .708-.226.985-.498l2.362-2.298l4.915 3.631c.905.498 1.556.241 1.782-.837l3.222-15.182c.331-1.329-.505-1.934-1.409-1.543z" fill="currentColor" />
                </svg>
                Login with Telegram
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    );
  }

  if (ready && authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen p-4 bg-background pixel-pattern"
      >
        <Header />


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-screen items-center justify-center p-4 bg-background pixel-pattern flex-col"
        >
          <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
            <CardHeader>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <CardTitle className="text-2xl font-bold text-center text-foreground pixel-text">
                  Wallet Profile
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence>
                {user ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-center mb-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="h-24 w-24 ring-2 ring-purple-500 ring-offset-2 ring-offset-background pixel-borders">
                          <AvatarImage src={user.telegram?.photoUrl ?? undefined} alt={user.telegram?.username ?? undefined} />
                          <AvatarFallback className="bg-purple-600 text-white text-2xl pixel-text">
                            {user.telegram?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </div>
                    <div className="space-y-4">
                      <motion.div
                        className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border-2 border-purple-500 hover:bg-card/70 transition-colors pixel-borders"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <User className="h-5 w-5 text-purple-400" />
                        <div className="space-y-1 flex-1">
                          <p className="text-sm text-muted-foreground pixel-text">Username</p>
                          <p className="font-medium text-foreground pixel-text">{user.telegram?.username}</p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border-2 border-purple-500 hover:bg-card/70 transition-colors group cursor-pointer overflow-hidden pixel-borders"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => user.wallet?.address && copyToClipboard(user.wallet.address)}
                      >
                        <WalletIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-sm text-muted-foreground pixel-text">Wallet Address</p>
                          <p className="font-medium text-foreground font-mono text-sm break-all pixel-text">
                            {user.wallet?.address}
                          </p>
                        </div>
                        {copied ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        ) : (
                          <Copy className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        )}
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border-2 border-purple-500 hover:bg-card/70 transition-colors pixel-borders"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Coins className="h-5 w-5 text-purple-400" />
                        <div className="space-y-1 flex-1">
                          <p className="text-sm text-muted-foreground pixel-text">Balance</p>
                          <p className="font-medium text-foreground pixel-text">
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                              </span>
                            ) : (
                              `${balance?.toFixed(4) ?? '0'} SOL`
                            )}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border-2 border-purple-500 hover:bg-card/70 transition-colors pixel-borders"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Key className="h-5 w-5 text-purple-400" />
                        <div className="space-y-1 flex-1">
                          <p className="text-sm text-muted-foreground pixel-text">Chain Type</p>
                          <p className="font-medium text-foreground capitalize pixel-text">{user.wallet?.chainType}</p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text"
                          onClick={handleExportWallet}
                          disabled={!isAuthenticated || !hasEmbeddedWallet}
                        >
                          <Send className="h-5 w-5" />
                          Export Wallet
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="destructive"
                          className="w-full gap-2 bg-red-600 hover:bg-red-700 pixel-borders pixel-text"
                          onClick={logout}
                        >
                          <LogOut className="h-5 w-5" />
                          Logout
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex flex-col items-center gap-4 py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    <p className="text-muted-foreground pixel-text">Creating wallet...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default Login;