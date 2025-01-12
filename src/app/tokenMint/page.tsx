'use client'; // This is for client-side rendering

import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const ConnectedPage = () => {
  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    if (ready) {
      console.log('User:', user);
    }
  }, [ready, user]);

  useEffect(() => {
    // Fetch query parameters (if they exist)
    const urlParams = new URLSearchParams(window.location.search);
    console.log('URL Params:', urlParams);
    const data = urlParams.get('data');
    const nonce = urlParams.get('nonce');

    // Only proceed if user, username, and the necessary query parameters are defined
    if (user?.telegram?.username && data && nonce) {
      const sendToBackend = async () => {
        const payload = {
          data,
          nonce,
          urlParams
        };
        const username = user.telegram?.username;

        try {
          const response = await fetch('/api/telegram/tokenMint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, ...payload }),
          });

          const result = await response.json();

          if (response.ok) {
            alert('Data successfully sent to backend!');
          } else {
            alert('Failed to send data to backend.');
          }
        } catch (error) {
          console.error('Error sending data to backend:', error);
          alert('An error occurred while sending data.');
        }
      };

      sendToBackend();
    }
  }, [user?.telegram?.username]); // Dependency array includes username to trigger the effect when it becomes available

  if (!(ready && authenticated) || !user) {
    return <>Loading...</>;
  }

  return (
    <div>
      <h1>Wallet Connected Successfully!</h1>
      <p>Welcome to token mInt </p>
      <p>Processing your wallet connection...</p>
    </div>
  );
};

export default ConnectedPage;
