'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, Link } from 'lucide-react';

const ConnectedPage = () => {
  const { ready, authenticated, user } = usePrivy();
  const [status, setStatus] = useState<'waiting' | 'loading' | 'success' | 'error'>('waiting');
  const [connectionData, setConnectionData] = useState<{
    data: string;
    nonce: string;
    phantom_encryption_public_key: string;
    urlParams: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    if (ready) {
      console.log('User:', user);
    }
  }, [ready, user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('URL Params:', urlParams);
    const data = urlParams.get('data');
    const nonce = urlParams.get('nonce');
    const phantom_encryption_public_key = urlParams.get('phantom_encryption_public_key');

    if (data && nonce && phantom_encryption_public_key) {
      setConnectionData({
        data,
        nonce,
        phantom_encryption_public_key,
        urlParams: Object.fromEntries(urlParams)
      });
    }
  }, []);

  const handleConnect = async () => {
    if (!connectionData || !user?.telegram?.username) return;

    setStatus('loading');
    const username = user.telegram?.username;

    try {
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          ...connectionData 
        }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setStatus('error');
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
    <div className="flex min-h-screen items-center justify-center bg-background pixel-pattern">
      <Card className="w-[380px] bg-card/20 backdrop-blur-xl border-2 border-purple-500 pixel-borders">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground pixel-text">
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            {status === 'waiting' && connectionData && (
              <>
                <Link className="h-16 w-16 text-purple-400" />
                <p className="text-foreground pixel-text text-center">Ready to connect your wallet</p>
                <p className="text-muted-foreground pixel-text text-center text-sm">
                  Click the button below to confirm the connection
                </p>
                <Button 
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text" 
                  onClick={handleConnect}
                >
                  Connect Wallet
                </Button>
              </>
            )}
            
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
                <p className="text-foreground pixel-text text-center">Processing your wallet connection...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-foreground pixel-text text-center">Wallet Connected Successfully!</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <p className="text-foreground pixel-text text-center">Error connecting wallet. Please try again.</p>
                <Button 
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 pixel-borders pixel-text" 
                  onClick={handleConnect}
                >
                  Retry Connection
                </Button>
              </>
            )}
            
            <p className="text-muted-foreground pixel-text text-center mt-4">
              Welcome, {user.telegram?.username}!
            </p>
            
            {(status === 'success' || !connectionData) && (
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

export default ConnectedPage;