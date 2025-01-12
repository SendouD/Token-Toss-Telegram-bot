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
        console.log('Data:', data);
        console.log('Nonce:', nonce);
        console.log('Signature:', signature);
      
 
      }, []); // Dependency array includes username to trigger the effect when it becomes available
    
  return (
    <div>{transId}</div>
  )
}

export default Transfer