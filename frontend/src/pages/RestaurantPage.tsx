import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import { VscLoading } from "react-icons/vsc";

const RestaurantPage = () => {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data || null);
    } catch (error) {
      console.log(error);
    } fontally: {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <VscLoading className="h-8 w-8 animate-spin text-[#2E6327]" />
        <p className="font-heading text-base text-[#3D443E]">Loading restaurant menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="font-heading text-lg text-[#3D443E]">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-8 space-y-8">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={false}
      />

      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 border border-[#E2E6DF] shadow-xs space-y-6">
        <div className="border-b border-[#E2E6DF] pb-4">
          <h3 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            Menu Items 🧺
          </h3>
          <p className="text-xs text-[#3D443E] mt-0.5">
            Select items to add to your Goblin Basket
          </p>
        </div>

        <MenuItems
          isSeller={false}
          items={menuItems}
          onItemDeleted={() => {}}
        />
      </div>
    </div>
  );
};

export default RestaurantPage;
