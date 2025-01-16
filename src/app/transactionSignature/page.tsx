'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

const TransactionSignature = () => {
  const { ready, authenticated, user } = usePrivy();
  const [status, setStatus] = useState('waiting');
  const [signature, setSignature] = useState('');

  const truncateSignature = (sig: string | any[]) => {
    if (!sig || sig.length <= 12) return sig;
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  };

  const viewOnExplorer = (sig: string) => {
    window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!ready || !authenticated || !user?.telegram?.username) {
          return;
        }

        setStatus('loading');
        
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        const nonce = urlParams.get('nonce');
        console.log(data);
        
        if (!user?.telegram?.username || !data || !nonce) {
          throw new Error('Missing required data');
        }
  
        const response = await fetch('/api/telegram/transactionSignature', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: user.telegram.username, 
            data, 
            nonce 
          }),
        });
        console.log(response)
  
        if (!response.ok) {
          throw new Error('Failed to fetch transaction signature');
        }

        const result = await response.json();
        
        if (result.status === 'OK' && result.data) {
          setSignature(result.data);
          setStatus('success');
        } else {
          throw new Error('Invalid response data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatus('error');
      }
    };

    fetchData();
  }, [ready, authenticated, user]);

  if (!ready || !authenticated || !user) {
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
    <div className="flex min-h-screen items-center justify-center bg-background pixel-pattern">
      <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground pixel-text">
            Transaction Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
                <p className="text-foreground pixel-text text-center">Processing transaction...</p>
              </>
            )}
            
            {status === 'success' && signature && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="text-foreground pixel-text text-center space-y-2">
                  <p>Transaction successful!</p>
                  <div className="p-2 bg-card/50 rounded-lg border border-purple-500">
                    <span className="font-mono">{truncateSignature(signature)}</span>
                  </div>
                  <Button
                    className="mt-2 gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text"
                    onClick={() => viewOnExplorer(signature)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Explorer
                  </Button>
                </div>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <p className="text-foreground pixel-text text-center">Error processing transaction. Please try again.</p>
                <Button 
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </>
            )}
            
            <p className="text-muted-foreground pixel-text text-center mt-4">
              Welcome, {user.telegram?.username}!
            </p>
            
            {(status === 'success' || status === 'error') && (
              <Button 
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text" 
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSignature;