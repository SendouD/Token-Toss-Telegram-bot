'use client'
import React ,{useEffect, useState} from 'react'

const Transfer = () => {
    const [transId,setTransId] = useState('');
      useEffect(() => {
        // Fetch query parameters (if they exist)
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL Params:', urlParams);
        const data = urlParams.get('data');
        const nonce = urlParams.get('nonce');
        const signature = urlParams.get('signature');
 
        // // Only proceed if user, username, and the necessary query parameters are defined
        // if (user?.telegram?.username && data && nonce && phantom_encryption_public_key) {
        //   const sendToBackend = async () => {
        //     const payload = {
        //       data,
        //       nonce,
        //       phantom_encryption_public_key,
        //     };
        //     const username = user.telegram?.username;
    
        //     try {
        //       const response = await fetch('/api/telegram/connect', {
        //         method: 'POST',
        //         headers: {
        //           'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ username, ...payload }),
        //       });
    
        //       const result = await response.json();
        //       console.log('Backend response:', result);
    
        //       if (response.ok) {
        //         alert('Data successfully sent to backend!');
        //       } else {
        //         alert('Failed to send data to backend.');
        //       }
        //     } catch (error) {
        //       console.error('Error sending data to backend:', error);
        //       alert('An error occurred while sending data.');
        //     }
        //   };
    
        //   sendToBackend();
        // }
      }, []); // Dependency array includes username to trigger the effect when it becomes available
    
  return (
    <div>{transId}</div>
  )
}

export default Transfer