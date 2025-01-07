'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy, Wallet, WalletWithMetadata } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WalletIcon, LogOut, Send, User, Key, Loader2, Copy, CheckCircle2, TextIcon as Telegram } from 'lucide-react';
import { toast } from 'sonner';


const Login = () => {
  const { login, authenticated, user, ready, logout } = usePrivy();
  const { createWallet, exportWallet } = useSolanaWallets();
  const [copied, setCopied] = useState(false);
  let wallet: Wallet;
  const hasEmbeddedWallet = !!user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' &&
      account.walletClient === 'privy' &&
      account.chainType === 'solana',
  );
  
  const isAuthenticated = ready && authenticated;

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
        className="flex min-h-screen items-center justify-center bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900"
      >
        <Card className="w-[380px] bg-black/20 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-10 w-full bg-white/5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (ready && !authenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex min-h-screen items-center justify-center p-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900"
      >
        <Card className="w-[380px] bg-black/20 backdrop-blur-xl border-white/10">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-white">
                <WalletIcon className="h-6 w-6 text-purple-400" />
                Connect Wallet
              </CardTitle>
              <CardDescription className="text-center text-gray-400 mt-2">
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
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 hover:scale-105" 
                onClick={() => login({ loginMethods: ['telegram'] })}
              >
                <Telegram className="h-5 w-5" />
                Login with Telegram
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (ready && authenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex min-h-screen items-center justify-center p-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900"
      >
        <Card className="w-[380px] bg-black/20 backdrop-blur-xl border-white/10">
          <CardHeader>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <CardTitle className="text-2xl font-bold text-center text-white">
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
                      <Avatar className="h-24 w-24 ring-2 ring-purple-500 ring-offset-2 ring-offset-black">
                        <AvatarImage src={user.telegram?.photoUrl ?? undefined} alt={user.telegram?.username??undefined} />
                        <AvatarFallback className="bg-purple-600 text-white text-2xl">
                          {user.telegram?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <User className="h-5 w-5 text-purple-400" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm text-gray-400">Username</p>
                        <p className="font-medium text-white">{user.telegram?.username}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => user.wallet?.address && copyToClipboard(user.wallet.address)}
                    >
                      <WalletIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm text-gray-400">Wallet Address</p>
                        <p className="font-medium text-white font-mono text-sm break-all">
                          {user.wallet?.address}
                        </p>
                      </div>
                      {copied ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      ) : (
                        <Copy className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Key className="h-5 w-5 text-purple-400" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm text-gray-400">Chain Type</p>
                        <p className="font-medium text-white capitalize">{user.wallet?.chainType}</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300" 
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
                        className="w-full gap-2 bg-red-600 hover:bg-red-700" 
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
                  <p className="text-gray-400">Creating wallet...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
};

export default Login;

