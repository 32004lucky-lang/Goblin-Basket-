import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-[#C98B2C]/15 text-[#C98B2C]";
    case "accepted":
      return "bg-amber-100 text-amber-800";
    case "preparing":
      return "bg-[#EAF5E4] text-[#2E6327]";
    case "ready_for_rider":
      return "bg-emerald-100 text-emerald-800";
    case "picked_up":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-[#8FD14F]/25 text-[#2E6327]";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order status updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <p className="font-heading text-sm font-bold text-[#1A1A1A]">
          Order #{order._id.slice(-6).toUpperCase()}
        </p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColor(
            order.status
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="text-xs sm:text-sm text-[#3D443E] space-y-1">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.name} x <strong>{item.quauntity}</strong>
          </p>
        ))}
      </div>

      <div className="flex justify-between text-sm font-heading font-bold text-[#1A1A1A]">
        <span>Total</span>
        <span className="text-[#2E6327]">₹{order.totalAmount}</span>
      </div>

      <p className="text-[11px] text-gray-400">Payment Status: {order.paymentStatus}</p>

      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {actions.map((status) => (
            <button
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="rounded-full bg-[#2E6327] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#224b1d] disabled:opacity-50 transition-all shadow-xs"
            >
              Mark as {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-2">
          <button
            className="w-full rounded-full border border-[#2E6327] py-2 text-xs font-bold text-[#2E6327] hover:bg-[#EAF5E4] disabled:opacity-50 transition-colors"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Retry Ready for Rider
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
