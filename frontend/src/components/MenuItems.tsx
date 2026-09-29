import { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailiblity = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const { fetchCart } = useAppData();

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message || "Added to basket! 🧺");
      fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#3D443E] font-medium">No menu items available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            className={`group relative flex flex-col justify-between rounded-2xl bg-white p-4 border border-[#E2E6DF] shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#8FD14F]/50 ${
              !item.isAvailable ? "opacity-75 bg-gray-50" : ""
            }`}
            key={item._id}
          >
            <div className="space-y-3">
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-[#F8F6F0]">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    !item.isAvailable ? "grayscale brightness-75" : ""
                  }`}
                />
                {!item.isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#1C1A17]/60 font-heading text-xs font-bold text-white backdrop-blur-xs">
                    Unavailable
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-[#1A1A1A]">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="mt-1 text-xs text-[#3D443E] line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#E2E6DF]/60">
              <p className="font-heading text-lg font-bold text-[#2E6327]">
                ₹{item.price}
              </p>

              {isSeller && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAvailiblity(item._id)}
                    className="rounded-lg p-2 text-[#3D443E] hover:bg-[#EAF5E4] hover:text-[#2E6327] transition-colors"
                    title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  >
                    {item.isAvailable ? (
                      <BsEye size={18} />
                    ) : (
                      <FiEyeOff size={18} />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg p-2 text-[#D95D24] hover:bg-orange-50 transition-colors"
                    title="Delete Item"
                  >
                    <BiTrash size={18} />
                  </button>
                </div>
              )}

              {!isSeller && (
                <button
                  disabled={!item.isAvailable || isLoading}
                  onClick={() => addToCart(item.restaurantId, item._id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold text-xs transition-all ${
                    !item.isAvailable || isLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#2E6327] text-white hover:bg-[#224b1d] shadow-xs active:scale-95"
                  }`}
                >
                  {isLoading ? (
                    <VscLoading size={16} className="animate-spin" />
                  ) : (
                    <>
                      <BsCartPlus size={15} />
                      <span>Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
