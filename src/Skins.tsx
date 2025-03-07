import { useState, useEffect } from 'react';
import BuyCard from './components/BuyCard';
import DisplayCard from "./components/DisplayCard";
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './Context';
import KnCHR from './assets/KnChr.jpg';
import TnCHR from "./assets/TnCHR.jpg";
import ScCHR from "./assets/ScCHR.jpg";
import MgCHR from "./assets/MgCHR.jpg";
import HlCHR from "./assets/HlCHR.jpg";
import map2 from './assets/map2.jpeg';
import SkinsBg from "./assets/skins.jpeg";

interface Item {
  id: number;
  price: number;
  name: string;
}

const buyableSkins: { [key: string]: { image: string; title: string; category: string } } = {
  KnCHR: { image: KnCHR, title: 'Knight of Christmas', category: "KnightCard" },
  TnCHR: { image: TnCHR, title: 'Tank of Christmas', category: "TankCard" },
  ScCHR: { image: ScCHR, title: 'Scout of Christmas', category: "ScoutCard" },
  MgCHR: { image: MgCHR, title: 'Mage of Christmas', category: "MageCard" },
  HlCHR: { image: HlCHR, title: 'Healer of Christmas', category: "HealerCard" },
};

const collabSkins: { [key: string]: { image: string; title: string; category: string } } = {
  map2: { image: map2, title: 'Depth of Fire', category: "Map" },
};

const Skins: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [boughtItems, setBoughtItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { account, contract, skinImageMap, updateSkinImage } = useAppContext();
  const [currentSkins, setCurrentSkins] = useState<{ [key: string]: string }>({});
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'current' | 'available' | 'collab'>('current');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      if (!account || !contract) return;
      try {
        setLoading(true);
        const rawItems: any[] = await contract.getItemsDetails();
        const allItems = rawItems.map((item: any, index: number) => ({
          id: index,
          price: Number(item[0]),
          name: String(item[1]),
        }));
        const userBoughtItems: any[] = await contract.getItemsIdBoughtByUser(account);
        const boughtSet = new Set(userBoughtItems.map((id) => Number(id)));    
        setItems(allItems);
        setBoughtItems(boughtSet);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [account, contract]);

  useEffect(() => {
    setCurrentSkins(skinImageMap);
  }, [skinImageMap]);

  const handleBuy = async (id: number, price: number) => {
    if (!contract) return;
    try {
      const bigIntPrice = BigInt(price);
      const tx = await contract.buyItem(id, { value: bigIntPrice });
      await tx.wait();
      setBoughtItems((prev) => new Set(prev).add(id));
    } catch (error) {
      alert(
        "Error buying item : Insufficient Funds. Go To https://scan.test2.btcs.network/faucet to get some tokens."
        )
      console.error("Error buying item:", error);
    }
  };
  

  const chooseBoughtSkin = (name: string, imgLoc: string) => {
    const category = buyableSkins[name].category;
    updateSkinImage(category, imgLoc);

    setCurrentSkins((prev) => ({
      ...prev,
      [category]: imgLoc,
    }));
    setSelectionMessage("Skin selected!");
    setTimeout(() => setSelectionMessage(null), 1500);
  };

  const chooseSkin = (name: string, imgLoc: string,) => {
    const category = collabSkins[name].category;
    updateSkinImage(category, imgLoc);
    setCurrentSkins((prev) => ({ ...prev, [category]: imgLoc }));
    setSelectionMessage("Skin selected!");
    setTimeout(() => setSelectionMessage(null), 1500);
  };

  const goLobby = () => navigate('/');

  const renderSection = () => {
    switch (activeSection) {
        case 'current':
          return (
            <section className="current-skins">
              <h2 className="medievalsharp-regular skin-subtitle">Current Skins</h2>
              <div className="skin-cardContainer">
                {Object.entries(currentSkins).map(([key, value]) => (
                  <DisplayCard
                    key={key}
                    image={value}
                    title={key.replace("Card", "")}
                  />
                ))}
              </div>
            </section>
          );
        case 'available':
          return (
            <section className="all-skins">
              <h2 className="medievalsharp-regular skin-subtitle">Available Skins</h2>
              {selectionMessage && <h3 className="skin-selection-message medievalsharp-regular">{selectionMessage}</h3>}
              <div className="skin-cardContainer">
                {Object.entries(buyableSkins).map(([key, { image, title }]) => {
                  const item = items.find((i) => i.name === key);
                  const isBought = item ? boughtItems.has(item.id) : false;
  
                  if (item) {
                    return (
                      <BuyCard
                        key={item.id}
                        image={image}
                        title={title}
                        onAction={() =>
                          isBought
                            ? chooseBoughtSkin(key, image)
                            : handleBuy(item.id, item.price)
                        }
                        buttonText={isBought ? "Select" : `${item.price} wei`}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </section>
          );
          case 'collab':
            return (
              <section className="all-skins">
                <h2 className="medievalsharp-regular skin-subtitle">Core Skins</h2>
                {selectionMessage && <h3 className="skin-selection-message medievalsharp-regular">{selectionMessage}</h3>}
                <div className="skin-cardContainer">
                  {Object.entries(collabSkins).map(([key, { image, title }]) => {
                    const item = items.find((i) => i.name === key);
                    const isBought = item ? boughtItems.has(item.id) : false;
    
                    if(item){
                    return (
                      <BuyCard
                        key={item.id}
                        image={image}
                        title={title}
                        onAction={() =>
                          isBought
                            ? chooseSkin(key, image)
                            : handleBuy(item.id,item.price)
                        }
        
                        buttonText={isBought ? "Select" :`${item.price} wei`}
                      />
                    );
                  }
                  })}
                </div>
              </section>
            );
      default:
        return null;
    }
  };

  return (
<div
  className="skin-container w-full min-h-screen bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${SkinsBg})` }}
>

      <button className="skin-backButton merienda-regular" onClick={goLobby}>
        Back
      </button>
  
      {(!account || !contract) ? (
        <h1 className="skin-error merienda-regular">Please connect wallet first!</h1>
      ) : loading ? (
        <h1 className="skin-loading merienda-regular">Loading items...</h1>
      ) : (
        <>
          <header className="skin-header">
            <h1 className="skin-title medievalsharp-bold">Skin Selection</h1>
          </header>

          <div className="skin-navButtons">
            <button onClick={() => setActiveSection('current')} className="skin-navButton merienda-regular">Current Skins</button>
            <button onClick={() => setActiveSection('available')} className="skin-navButton merienda-regular">Available Skins</button>
            <button onClick={() => setActiveSection('collab')} className="skin-navButton merienda-regular">Core Skins</button>
          </div>
          {renderSection()}
        </>
      )}
    </div>
  );
};  

export default Skins;
