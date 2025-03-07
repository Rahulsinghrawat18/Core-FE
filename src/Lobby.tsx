/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { ethers } from 'ethers';
import { useAppContext } from './Context';
import LobbyBg from "./assets/lobby.jpg";
import contractABI from './abi.json';

 const serverURL = "https://core-server-wxr9.onrender.com"
//const serverURL = "http://localhost:3000"
// CORE local network settings
const contractAddress = '0x1AA7a043487bf78C64B28b810dE8c63246B04edc'; // Default CORE first address
const CORE_NETWORK = {
  chainId: '0x45a', // 1114 in hex
  chainName: 'Core Blockchain Testnet2',
  rpcUrls: ['https://rpc.test2.btcs.network/'],  // Default CORE URL
};

interface LobbyProps {
  socket: Socket;
}

declare global {
  interface Window {
  
    ethereum?: any;
  }
}

function Lobby({ socket }: LobbyProps) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const { account, setAccount, setContract } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or an Ethereum-compatible wallet.');
      return;
    }

    try {
      setLoading(true);
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Check if we're on CORE network, if not, try to switch
      if (currentChainId !== CORE_NETWORK.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CORE_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: CORE_NETWORK.chainId,
                  chainName: CORE_NETWORK.chainName,
                  rpcUrls: CORE_NETWORK.rpcUrls,
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                }],
              });
            } catch (addError) {
              console.error('Error adding CORE network:', addError);
              setError('Failed to add CORE network to MetaMask');
              setLoading(false);
              return;
            }
          } else {
            console.error('Error switching to CORE network:', switchError);
            setError('Failed to switch to CORE network');
            setLoading(false);
            return;
          }
        }
      }

      const [selectedAccount] = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Connect to local CORE provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

      setAccount(selectedAccount);
      setContract(contractInstance);
     // checkShapeKey(selectedAccount);

      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Make sure your CORE node is running.');
    } finally {
      setLoading(false);
    }
  };

  // const handleCreateRoom = async () => {
  //   if (!account) {
  //     setError('Please connect your wallet first');
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(`${serverURL}/create-room`);
  //     if (response.data.roomCode) {
  //       socket.emit('joinRoom', { roomCode: response.data.roomCode, walletConnected: account });
  //       navigate(`/board?roomCode=${response.data.roomCode}`);
  //     } else {
  //       setError('Failed to create room. Please try again');
  //     }
  //   } catch (err) {
  //     console.error('Error creating room:', err);
  //     setError('Error creating room. Please try again');
  //   }
  // };

  // const handleJoinRoom = async () => {
  //   if (!account) {
  //     setError('Please connect your wallet first');
  //     return;
  //   }

  //   if (!roomCode) {
  //     setError('Please enter room code');
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(`${serverURL}/join-room`, { roomCode });
  //     if (response.data.success) {
  //       socket.emit('joinRoom', { roomCode, walletConnected: account });
  //       navigate(`/board?roomCode=${roomCode}`);
  //     } else {
  //       setError('Failed to join the room. Please check the room code');
  //     }
  //   } catch (err) {
  //     console.error('Error joining room:', err);
  //     setError('Error joining room. Please try again');
  //   }
  // };

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post(`${serverURL}/create-room`);
      if (response.data.roomCode) {
        socket.emit('joinRoom', { roomCode: response.data.roomCode, walletConnected: account || 'Guest' });
        navigate(`/board?roomCode=${response.data.roomCode}`);
      } else {
        setError('Failed to create room. Please try again');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Error creating room. Please try again');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      setError('Please enter room code');
      return;
    }

    try {
      const response = await axios.post(`${serverURL}/join-room`, { roomCode });
      if (response.data.success) {
        socket.emit('joinRoom', { roomCode, walletConnected: account || 'Guest' });
        navigate(`/board?roomCode=${roomCode}`);
      } else {
        setError('Failed to join the room. Please check the room code');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Error joining room. Please try again');
    }
  }; 

  return (
    <div className="arena-container" style={{ backgroundImage: `url(${LobbyBg})` }}> {/* Dynamic background */}
      <h1 className="arena-title medievalsharp-bold">Core Battle Arena</h1>
      <div className="text-3xl flex flex-col gap-4 justify-center 
      m-4 p-4 font-bold rounded-md font-medieval 
      text-yellow-400 drop-shadow-[5px_5px_0px_#8b4513]">
  {account ? 'Connected to Core Blockchain Testnet' : 'Not Connected'}
  {account && (
    <h1>
      {account.slice(0, 6) + "..." + account.slice(-4)}
    </h1>
  )}
</div>

<button 
  className="text-white bg-gradient-to-r 
    from-purple-500 via-purple-600 to-purple-700 
    hover:bg-gradient-to-br focus:ring-4 focus:outline-none
    focus:ring-purple-300 dark:focus:ring-purple-800 
    shadow-lg shadow-purple-500/50 dark:shadow-lg 
    dark:shadow-purple-800/80 font-medium rounded-lg 
    text-2xl px-6 py-2.5 text-center me-2 mb-2 
    transition-all duration-200 ease-in-out
    transform translate-y-2 hover:translate-y-0 hover:shadow-xl hover:scale-x-105 hover:rotate-1
    active:translate-y-1 active:shadow-md"
  onClick={handleCreateRoom}
>
  Create a Room
</button>



      <div className="room-input-container">
        <input
          type="text"
          className="room-input merienda-regular"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button className="text-white bg-gradient-to-r 
    from-purple-500 via-purple-600 to-purple-700 
    hover:bg-gradient-to-br focus:ring-4 focus:outline-none
    focus:ring-purple-300 dark:focus:ring-purple-800 
    shadow-lg shadow-purple-500/50 dark:shadow-lg 
    dark:shadow-purple-800/80 font-medium rounded-lg 
    text-xl px-5 py-2.5 text-center me-2 mb-5
    transition-all duration-200 ease-in-out
    transform translate-y-2 shadow-md 
    hover:translate-y-0 hover:shadow-xl hover:scale-x-105 hover:rotate-1
    active:translate-y-1 active:shadow-md
        " onClick={handleJoinRoom}>
          Join a Room
        </button>
      </div>
      {error && <p className="error-text merienda-regular">{error}</p>}
      <button className="text-white bg-gradient-to-r 
    from-purple-500 via-purple-600 to-purple-700 
    hover:bg-gradient-to-br focus:ring-4 focus:outline-none
    focus:ring-purple-300 dark:focus:ring-purple-800 
    shadow-lg shadow-purple-500/50 dark:shadow-lg 
    dark:shadow-purple-800/80 font-medium rounded-lg 
    text-xl px-5 py-2.5 text-center me-2 m-5
    transition-all duration-200 ease-in-out
    transform translate-y-2 shadow-md 
    hover:translate-y-0 hover:shadow-xl hover:scale-x-105 hover:rotate-1
    active:translate-y-1 active:shadow-md" onClick={() => navigate('/how-to-play')}>
        How to Play
      </button>
      {!account ? (
        <button onClick={connectWallet} 
        className="text-white bg-gradient-to-r 
    from-purple-500 via-purple-600 to-purple-700 
    hover:bg-gradient-to-br focus:ring-4 focus:outline-none
    focus:ring-purple-300 dark:focus:ring-purple-800 
    shadow-lg shadow-purple-500/50 dark:shadow-lg 
    dark:shadow-purple-800/80 font-medium rounded-lg 
    text-xl px-5 py-2.5 text-center me-2 m-5
    transition-all duration-200 ease-in-out
    transform translate-y-2 shadow-md 
    hover:translate-y-0 hover:shadow-xl hover:scale-x-105 hover:rotate-1
    active:translate-y-1 active:shadow-md" 
        disabled={loading}>
          {loading ? 'Connecting...' : 'Connect to CORE'}
        </button>
      ) : (
        <button className='text-white bg-gradient-to-r 
    from-purple-500 via-purple-600 to-purple-700 
    hover:bg-gradient-to-br focus:ring-4 focus:outline-none
    focus:ring-purple-300 dark:focus:ring-purple-800 
    shadow-lg shadow-purple-500/50 dark:shadow-lg 
    dark:shadow-purple-800/80 font-medium rounded-lg 
    text-xl px-5 py-2.5 text-center me-2 m-5
    transition-all duration-200 ease-in-out
    transform translate-y-2 shadow-md 
    hover:translate-y-0 hover:shadow-xl hover:scale-x-105 hover:rotate-1
    active:translate-y-1 active:shadow-md' onClick={() => navigate('/skins')}>
          Select Skins
        </button>
      )}
    </div>
  );
}

export default Lobby;