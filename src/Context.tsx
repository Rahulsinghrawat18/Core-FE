import { createContext, useContext, useState, ReactNode} from 'react';
import ScoutCard from "./assets/ScoutCard.jpg";
import KnightCard from "./assets/KnightCard.jpg";
import HealerCard from "./assets/HealerCard.jpg";
import MageCard from "./assets/MageCard.jpg";
import TankCard from "./assets/TankCard.jpg";
import Map from "./assets/map.jpeg";
import { ethers } from "ethers";

// Core Blockchain configuration
const CORE_NETWORK = {
  chainId: '0x45a', // 1114 in hex
  name: 'Core Blockchain Testnet2',
  rpcUrl: 'https://rpc.test.btcs.network/',
};

interface ContextProps {
  account: string | null;
  contract: any;
  skinImageMap: { [key: string]: string };
  defaultSkins: { [key: string]: string };
  setAccount: (account: string | null) => void;
  setContract: (contract: any) => void;
  changeToDefault: () => void;
  updateSkinImage: (skinName: string, newImagePath: string) => void;
  isCoreConnected: boolean;
  lobbyBackground: string;
  setLobbyBackground: React.Dispatch<React.SetStateAction<string>>;
  connectWallet: () => Promise<void>; // Added to context
}

const AppContext = createContext<ContextProps | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const defaultSkins: { [key: string]: string } = {
  ScoutCard,
  KnightCard,
  HealerCard,
  MageCard,
  TankCard,
  Map,
};

export let skinImageMap: { [key: string]: string } = {
  ScoutCard,
  KnightCard,
  HealerCard,
  MageCard,
  TankCard,
  Map,
};

export const changeToDefault = () => {
  skinImageMap = defaultSkins;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [isCoreConnected, setIsCoreConnected] = useState(false);
  const [lobbyBackground, setLobbyBackground] = useState<string>('/assets/lobby.jpeg');

  const updateSkinImage = (skinName: string, newImagePath: string) => {
    if (skinImageMap[skinName]) {
      skinImageMap[skinName] = newImagePath;
    } else {
      console.warn(`Skin name "${skinName}" does not exist in the image map.`);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("MetaMask is not installed!");
      return;
    }

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (currentChainId !== CORE_NETWORK.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CORE_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: CORE_NETWORK.chainId,
                chainName: CORE_NETWORK.name,
                rpcUrls: [CORE_NETWORK.rpcUrl],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      const [selectedAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Signer Address:", await signer.getAddress()); // Using signer now

      setAccount(selectedAccount);
      setIsCoreConnected(true);

      window.ethereum.on('chainChanged', (chainId: string) => {
        setIsCoreConnected(chainId === CORE_NETWORK.chainId);
        if (chainId !== CORE_NETWORK.chainId) {
          setAccount(null);
        }
      });

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setIsCoreConnected(false);
        } else {
          setAccount(accounts[0]);
        }
      });

    } catch (error) {
      console.error("Error connecting to Core network:", error);
      setIsCoreConnected(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        account,
        contract,
        setAccount,
        setContract,
        defaultSkins,
        skinImageMap,
        updateSkinImage,
        changeToDefault,
        isCoreConnected,
        lobbyBackground,
        setLobbyBackground,
        connectWallet, // Added to context so it can be used in components
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
