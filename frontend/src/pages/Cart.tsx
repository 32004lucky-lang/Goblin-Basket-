import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
import { FaShoppingBasket } from "react-icons/fa";

const Cart = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF5E4] text-[#2E6327]">
          <FaShoppingBasket className="h-10 w-10 text-[#2E6327]" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">
          Your Goblin Basket is Empty
        </h2>
        <p className="max-w-xs text-sm text-[#3D443E]">
          Explore delicious meals from local restaurants and fill up your basket!
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-full bg-[#2E6327] px-6 py-3 font-heading text-sm font-bold text-white shadow-md hover:bg-[#224b1d] transition-all"
        >
          Explore Menu 🧺
        </button>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your basket?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  const checkout = () => {
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Title */}
      <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
        Your Goblin Basket 🧺
      </h1>

      {/* Restaurant Header */}
      <div className="rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C98B2C]">
          Ordering From
        </span>
        <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">
          {restaurant.name}
        </h2>
        <p className="text-xs text-[#3D443E] mt-0.5">
          {restaurant.autoLocation?.formattedAddress || "Location unavailable"}
        </p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4">
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          const isLoading = loadingItemId === item._id;

          return (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-white p-4 border border-[#E2E6DF] shadow-xs"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover bg-[#F8F6F0]"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base font-bold text-[#1A1A1A] truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#2E6327]">
                    ₹{item.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:flex-1 gap-4 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-[#E2E6DF] pt-3 sm:pt-0">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3 bg-[#F8F6F0] p-1.5 rounded-full border border-[#E2E6DF]">
                  <button
                    className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white text-[#2E6327] shadow-xs hover:bg-[#EAF5E4] disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                    onClick={() => decreaseQty(item._id)}
                  >
                    {isLoading ? (
                      <VscLoading size={14} className="animate-spin" />
                    ) : (
                      <BiMinus size={14} />
                    )}
                  </button>
                  <span className="font-bold text-xs text-[#1A1A1A] min-w-4 text-center">
                    {cartItem.quauntity}
                  </span>
                  <button
                    className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white text-[#2E6327] shadow-xs hover:bg-[#EAF5E4] disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                    onClick={() => increaseQty(item._id)}
                  >
                    {isLoading ? (
                      <VscLoading size={14} className="animate-spin" />
                    ) : (
                      <BiPlus size={14} />
                    )}
                  </button>
                </div>

                <p className="sm:w-20 text-right font-heading text-lg sm:text-base font-bold text-[#1A1A1A]">
                  ₹{item.price * cartItem.quauntity}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary Box */}
      <div className="rounded-2xl bg-white p-6 border border-[#E2E6DF] shadow-xs space-y-4">
        <h3 className="font-heading text-lg font-bold text-[#1A1A1A] border-b border-[#E2E6DF] pb-3">
          Bill Details
        </h3>

        <div className="space-y-2.5 text-sm text-[#3D443E]">
          <div className="flex justify-between">
            <span>Total Items</span>
            <span className="font-semibold">{quauntity}</span>
          </div>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">₹{subTotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold">
              {deliveryFee === 0 ? (
                <span className="text-[#2E6327] font-bold">FREE</span>
              ) : (
                `₹${deliveryFee}`
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span className="font-semibold">₹{platformFee}</span>
          </div>

          {subTotal < 250 && (
            <div className="rounded-xl bg-[#EAF5E4] p-3 text-xs font-semibold text-[#2E6327] border border-[#2E6327]/20">
              💡 Add items worth ₹{250 - subTotal} more to unlock FREE Delivery!
            </div>
          )}
        </div>

        <div className="flex justify-between text-lg font-heading font-extrabold text-[#1A1A1A] border-t border-[#E2E6DF] pt-3">
          <span>Grand Total</span>
          <span className="text-[#2E6327]">₹{grandTotal}</span>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={checkout}
            className={`w-full rounded-full bg-[#2E6327] py-3.5 font-heading text-base font-bold text-white shadow-md hover:bg-[#224b1d] transition-all active:scale-[0.99] ${
              !restaurant.isOpen ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!restaurant.isOpen}
          >
            {!restaurant.isOpen ? "Restaurant is Closed" : "Proceed to Checkout 🧺"}
          </button>

          <button
            onClick={clearCart}
            className="w-full rounded-full bg-[#1C1A17] py-3 text-sm font-semibold text-white hover:bg-black transition-all flex justify-center items-center gap-2"
            disabled={clearingCart}
          >
            Clear Basket <TbTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
