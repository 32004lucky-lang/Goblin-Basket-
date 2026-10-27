import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import { VscLoading } from "react-icons/vsc";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant]);

  if (loading)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8F6F0]">
        <VscLoading className="h-8 w-8 animate-spin text-[#2E6327]" />
        <p className="font-heading text-base text-[#3D443E]">Loading your restaurant dashboard...</p>
      </div>
    );

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-8 space-y-6">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={true}
      />

      <RestaurantOrders restaurantId={restaurant._id} />

      <div className="mx-auto max-w-5xl rounded-3xl bg-white border border-[#E2E6DF] shadow-xs overflow-hidden">
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-[#E2E6DF] bg-[#F8F6F0]/50">
          {[
            { key: "menu", label: "Menu Items" },
            { key: "add-item", label: "+ Add Item" },
            { key: "sales", label: "Sales & Analytics" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as SellerTab)}
              className={`flex-1 px-4 py-3.5 font-heading text-sm font-bold transition-all min-w-[120px] ${
                tab === t.key
                  ? "border-b-2 border-[#2E6327] text-[#2E6327] bg-white"
                  : "text-[#3D443E] hover:text-[#1A1A1A]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "menu" && (
            <MenuItems
              items={menuItems}
              onItemDeleted={() => fetchMenuItems(restaurant._id)}
              isSeller={true}
            />
          )}
          {tab === "add-item" && (
            <AddMenuItem onItemAdded={() => fetchMenuItems(restaurant._id)} />
          )}
          {tab === "sales" && (
            <div className="py-12 text-center text-[#3D443E]">
              <p className="font-heading font-bold text-lg text-[#1A1A1A]">Sales & Revenue Dashboard</p>
              <p className="text-sm mt-1">Analytics feature active for your Goblin Basket store.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
