import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async () => {
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  return (
    <div className="rounded-2xl bg-white shadow-xs border border-[#E2E6DF] p-5 space-y-4">
      <h1 className="font-heading text-xl font-bold text-[#1A1A1A] border-b border-[#E2E6DF] pb-2">Current Order</h1>

      <div className="text-sm text-[#3D443E] space-y-2">
        <p className="flex justify-between">
          <b className="text-[#1A1A1A]">Pickup:</b>
          <span className="text-right">{order.restaurantName}</span>
        </p>
        <p className="flex justify-between">
          <b className="text-[#1A1A1A]">Drop:</b>
          <span className="text-right max-w-[60%]">{order.deliveryAddress.fromattedAddress}</span>
        </p>
        <p className="flex justify-between">
          <b className="text-[#1A1A1A]">Total:</b>
          <span>₹{order.totalAmount}</span>
        </p>
        <p className="flex justify-between">
          <b className="text-[#1A1A1A]">Your Earning:</b>
          <span className="text-[#2E6327] font-bold">₹{order.riderAmount}</span>
        </p>
        <p className="flex justify-between">
          <b className="text-[#1A1A1A]">Status:</b>
          <span className="capitalize font-bold text-[#C98B2C]">
            {order.status.replace("_", " ")}
          </span>
        </p>
      </div>

      {order.deliveryAddress.mobile && (
        <div className="flex items-center justify-between rounded-xl border border-[#E2E6DF] p-4 bg-[#F8F6F0]">
          <div className="text-sm">
            <p className="text-[#3D443E] text-xs">Customer Phone</p>
            <p className="font-bold font-heading text-[#1A1A1A]">
              {order.deliveryAddress.mobile}
            </p>
          </div>
          <a
            href={`tel:${order.deliveryAddress.mobile}`}
            className="bg-[#2E6327] hover:bg-[#224b1d] text-white px-5 py-2 rounded-full text-sm font-bold shadow-xs transition-colors"
          >
            Call
          </a>
        </div>
      )}

      <div className="space-y-2 pt-2">
        {order.status === "rider_assigned" && (
          <button
            onClick={() => updateStatus()}
            className="w-full bg-[#1C1A17] hover:bg-black text-white rounded-full py-3 font-bold shadow-md transition-all active:scale-[0.98]"
          >
            Reached Restaurant
          </button>
        )}

        {order.status === "picked_up" && (
          <button
            onClick={() => updateStatus()}
            className="w-full bg-[#2E6327] hover:bg-[#224b1d] text-white rounded-full py-3 font-bold shadow-md transition-all active:scale-[0.98]"
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
