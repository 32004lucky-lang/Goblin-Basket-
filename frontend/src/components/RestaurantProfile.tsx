import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    try {
      await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: false },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      // continue logout even if status fails
    }
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white border border-[#E2E6DF] shadow-xs overflow-hidden">
      {restaurant.image && (
        <div className="relative h-48 w-full bg-[#F8F6F0]">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs ${
                isOpen ? "bg-[#2E6327]" : "bg-[#D95D24]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              {isOpen ? "OPEN NOW" : "CLOSED"}
            </span>
          </div>
        </div>
      )}
      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#E2E6DF] px-3 py-1.5 font-heading text-xl font-bold text-[#1A1A1A] outline-none focus:border-[#2E6327]"
              />
            ) : (
              <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">
                {restaurant.name}
              </h2>
            )}

            <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-[#3D443E]">
              <BiMapPin className="h-4 w-4 text-[#2E6327] shrink-0" />
              <span>
                {restaurant.autoLocation?.formattedAddress ||
                  "Location unavailable"}
              </span>
            </div>
          </div>

          {isSeller && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="self-end sm:self-auto rounded-lg p-2 text-[#3D443E] hover:bg-[#EAF5E4] hover:text-[#2E6327] transition-colors"
              title="Edit details"
            >
              <BiEdit size={20} />
            </button>
          )}
        </div>

        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[#E2E6DF] px-3 py-2 text-sm outline-none focus:border-[#2E6327]"
            rows={3}
          />
        ) : (
          <p className="text-sm text-[#3D443E]">
            {restaurant.description || "No description added yet."}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E6DF]">
          <span
            className={`w-fit font-heading text-xs font-bold px-3 py-1 rounded-full ${
              isOpen
                ? "bg-[#EAF5E4] text-[#2E6327]"
                : "bg-orange-50 text-[#D95D24]"
            }`}
          >
            STATUS: {isOpen ? "ONLINE" : "OFFLINE"}
          </span>

          <div className="flex flex-wrap gap-2">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-full bg-[#2E6327] px-4 py-2 text-xs font-semibold text-white hover:bg-[#224b1d] transition-all shadow-xs"
              >
                <BiSave size={16} />
                Save
              </button>
            )}

            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`rounded-full px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all flex-1 sm:flex-none ${
                  isOpen
                    ? "bg-[#D95D24] hover:bg-amber-700"
                    : "bg-[#2E6327] hover:bg-[#224b1d]"
                }`}
              >
                {isOpen ? "Close Store" : "Open Store"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={logoutHandler}
                className="rounded-full bg-gray-200 px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-300 transition-all flex-1 sm:flex-none"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-right">
          Registered on {new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
