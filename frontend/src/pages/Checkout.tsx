import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js";
import { FaShoppingBasket } from "react-icons/fa";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quauntity } = useAppData();

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setselectedAddressId] = useState<string | null>(
    null
  );

  const [loadingAddress, setLoadingAddress] = useState(true);

  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentMethod, setMockPaymentMethod] = useState<"razorpay" | "stripe" | null>(null);
  const [mockOrderId, setMockOrderId] = useState<string | null>(null);
  const [mockAmount, setMockAmount] = useState<number>(0);
  const [processingMockPay, setProcessingMockPay] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <FaShoppingBasket className="h-10 w-10 text-[#C98B2C]" />
        <p className="text-gray-500 text-lg font-heading">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      if (key?.includes("your") || razorpayOrderId?.startsWith("mock")) {
        setMockPaymentMethod("razorpay");
        setMockOrderId(orderId);
        setMockAmount(amount || grandTotal);
        setShowMockModal(true);
        return;
      }

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Goblin Basket",
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment successful 🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#2E6327",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId, amount } = order;

      const isPlaceholder = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.includes("your");

      if (isPlaceholder) {
        setMockPaymentMethod("stripe");
        setMockOrderId(orderId);
        setMockAmount(amount || grandTotal);
        setShowMockModal(true);
        return;
      }

      try {
        await stripePromise;

        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/create`,
          {
            orderId,
          }
        );

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("failed to create payment session");
        }
      } catch (error) {
        toast.error("Payment Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
        Checkout 🧺
      </h1>

      {/* Restaurant summary */}
      <div className="rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs">
        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">{restaurant.name}</h2>
        <p className="text-xs text-[#3D443E]">
          {restaurant.autoLocation?.formattedAddress}
        </p>
      </div>

      {/* Delivery address selection */}
      <div className="rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-[#E2E6DF] pb-3">
          <h3 className="font-heading font-bold text-[#1A1A1A]">Delivery Address</h3>
          <button
            onClick={() => navigate("/address")}
            className="text-xs font-bold text-[#2E6327] hover:underline"
          >
            + Add New Address
          </button>
        </div>

        {loadingAddress ? (
          <p className="text-xs text-[#3D443E]">Loading saved addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-xs text-[#3D443E]">
            No address found. Please add an address to proceed.
          </p>
        ) : (
          <div className="space-y-2.5">
            {addresses.map((add) => (
              <label
                key={add._id}
                className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                  selectedAddressId === add._id
                    ? "border-[#2E6327] bg-[#EAF5E4]/60 shadow-xs"
                    : "border-[#E2E6DF] hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === add._id}
                  onChange={() => setselectedAddressId(add._id)}
                  className="mt-1 accent-[#2E6327]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {add.formattedAddress}
                  </p>
                  <p className="text-xs text-[#3D443E]">Mobile: {add.mobile}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs space-y-3">
        <h3 className="font-heading font-bold text-[#1A1A1A] border-b border-[#E2E6DF] pb-2">Order Summary</h3>

        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;

          return (
            <div className="flex justify-between text-sm text-[#3D443E]" key={cartItem._id}>
              <span>
                {item.name} x <strong className="text-[#1A1A1A]">{cartItem.quauntity}</strong>
              </span>
              <span className="font-semibold text-[#1A1A1A]">₹{item.price * cartItem.quauntity}</span>
            </div>
          );
        })}

        <hr className="border-[#E2E6DF]" />

        <div className="flex justify-between text-sm text-[#3D443E]">
          <span>Items ({quauntity})</span>
          <span className="font-semibold text-[#1A1A1A]">₹{subTotal}</span>
        </div>
        <div className="flex justify-between text-sm text-[#3D443E]">
          <span>Delivery Fee</span>
          <span className="font-semibold text-[#1A1A1A]">
            {deliveryFee === 0 ? <strong className="text-[#2E6327]">Free</strong> : `₹${deliveryFee}`}
          </span>
        </div>
        <div className="flex justify-between text-sm text-[#3D443E]">
          <span>Platform Fee</span>
          <span className="font-semibold text-[#1A1A1A]">₹{platformFee}</span>
        </div>

        <div className="flex justify-between text-base font-heading font-extrabold text-[#1A1A1A] border-t border-[#E2E6DF] pt-3">
          <span>Grand Total</span>
          <span className="text-[#2E6327]">₹{grandTotal}</span>
        </div>
      </div>

      {/* Payment Selection */}
      <div className="rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs space-y-3">
        <h3 className="font-heading font-bold text-[#1A1A1A]">Select Payment Method</h3>

        <button
          disabled={!selectedAddressId || loadingRazorpay || loadingStripe || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2E6327] py-3.5 text-sm font-semibold text-white hover:bg-[#224b1d] disabled:opacity-50 transition-all active:scale-[0.99] shadow-md"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay with Razorpay (UPI / Cards / NetBanking)
        </button>

        <button
          disabled={!selectedAddressId || loadingStripe || loadingRazorpay || creatingOrder}
          onClick={payWithStripe}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1A17] py-3.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 transition-all active:scale-[0.99] shadow-md"
        >
          {loadingStripe ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay Online (Stripe)
        </button>

        <button
          disabled={!selectedAddressId || loadingStripe || creatingOrder}
          onClick={async () => {
            try {
              setCreatingOrder(true);
              const order = await createOrder("stripe");
              if (!order) return;

              const { orderId } = order;

              // Verify Cash Order immediately
              const mockSessionId = `mock_stripe_session_id_ORDERID_${orderId}`;
              await axios.post(`${utilsService}/api/payment/stripe/verify`, {
                sessionId: mockSessionId,
              });

              toast.success("Order Placed (Cash on Delivery) 🎉");
              navigate("/ordersuccess?session_id=" + mockSessionId);
            } catch (error) {
              toast.error("Failed to place Cash order");
            } finally {
              setCreatingOrder(false);
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8FD14F] py-3.5 text-sm font-bold text-[#1C1A17] hover:bg-[#7DBB3A] disabled:opacity-50 transition-all active:scale-[0.99] shadow-md"
        >
          {creatingOrder ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay With Cash (COD)
        </button>
      </div>

      {/* Mock Payment Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1A17]/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-[#E2E6DF]">
            <div className="text-center space-y-2">
              <img src="/logo.png" alt="Goblin Basket Logo" className="mx-auto h-14 w-14 object-contain" />
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">
                Goblin Basket Gateway
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Sandbox Secure Checkout
              </p>
              <div className="rounded-xl bg-[#F8F6F0] p-4 border border-[#E2E6DF] flex justify-between items-center">
                <span className="text-sm font-medium text-[#3D443E]">Amount to Pay</span>
                <span className="font-heading text-xl font-bold text-[#2E6327]">₹{mockAmount}</span>
              </div>
            </div>

            {/* Fake card form */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none font-mono text-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="12/29"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none text-gray-700 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="***"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none text-gray-700 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                disabled={processingMockPay}
                onClick={() => {
                  setShowMockModal(false);
                  setMockPaymentMethod(null);
                  setMockOrderId(null);
                }}
                className="w-full sm:w-1/2 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingMockPay}
                onClick={async () => {
                  try {
                    setProcessingMockPay(true);
                    if (mockPaymentMethod === "stripe") {
                      const mockSessionId = `mock_stripe_session_id_ORDERID_${mockOrderId}`;
                      await axios.post(`${utilsService}/api/payment/stripe/verify`, {
                        sessionId: mockSessionId,
                      });
                      toast.success("Payment successful 🎉");
                      navigate("/ordersuccess?session_id=" + mockSessionId);
                    } else {
                      const mockPaymentId = "mock_pay_" + Math.random().toString(36).substring(7);
                      await axios.post(`${utilsService}/api/payment/verify`, {
                        razorpay_order_id: "mock_order_id",
                        razorpay_payment_id: mockPaymentId,
                        razorpay_signature: "mock_sig_12345",
                        orderId: mockOrderId,
                      });
                      toast.success("Payment successful 🎉");
                      navigate("/paymentsuccess/" + mockPaymentId);
                    }
                  } catch (error) {
                    toast.error("Mock payment failed");
                  } finally {
                    setProcessingMockPay(false);
                    setShowMockModal(false);
                  }
                }}
                className="w-full sm:w-1/2 rounded-full bg-[#2E6327] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#224b1d] transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {processingMockPay ? (
                  <>
                    <BiLoader size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
