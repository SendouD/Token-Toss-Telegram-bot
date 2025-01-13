'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';

const ConnectedPage = () => {
  const { ready, authenticated, user } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (ready) {
      console.log('User:', user);
    }
  }, [ready, user]);

  const handleAddToBot = async () => {
    try {
      setIsProcessing(true);
      setMintStatus('idle');
      
      const urlParams = new URLSearchParams(window.location.search);
      console.log('URL Params:', urlParams);
      const data = urlParams.get('data');
      const nonce = urlParams.get('nonce');
      
      if (!user?.telegram?.username || !data || !nonce) {
        throw new Error('Missing required data');
      }

      const payload = {
        data,
        nonce
      };

      const username = user.telegram.username;

      const response = await fetch('/api/telegram/tokenMint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, ...payload }),
      });

      if (!response.ok) {
        throw new Error('Failed to mint token');
      }

      setMintStatus('success');
      toast.success('Token successfully added to bot!');
      
    } catch (error) {
      console.error('Error adding token to bot:', error);
      setMintStatus('error');
      toast.error('An error occurred while adding token to bot.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!(ready && authenticated) || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pixel-pattern">
        <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
          <CardContent className="p-6 flex flex-col items-center">
            <Loader2 className="h-16 w-16 animate-spin text-purple-400 mb-4" />
            <p className="text-foreground pixel-text text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pixel-pattern">
      <Header></Header>
    <div className="flex min-h-screen items-center justify-center bg-background pixel-pattern">
     
      <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground pixel-text">
            Token Mint
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="h-24 flex items-center justify-center">
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
                  <p className="text-foreground pixel-text text-center mt-2">Adding it to the bot...</p>
                </motion.div>
              )}
              
              {!isProcessing && mintStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <p className="text-foreground pixel-text text-center mt-2">Added to bot successfully!</p>
                </motion.div>
              )}
              
              {!isProcessing && mintStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <AlertTriangle className="h-16 w-16 text-red-500" />
                  <p className="text-foreground pixel-text text-center mt-2">Error minting token. Please try again.</p>
                </motion.div>
              )}
            </div>

            <p className="text-muted-foreground pixel-text text-center mt-4">
              Lesss goo, {user.telegram?.username}!
            </p>
            
            <Button 
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text"
              onClick={handleAddToBot}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add This to Bot
            </Button>
            
            <Button 
              className="mt-2 w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 pixel-borders pixel-text" 
              onClick={() => window.location.href = '/'}
              disabled={isProcessing}
            >
              Return to Home
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default ConnectedPage;