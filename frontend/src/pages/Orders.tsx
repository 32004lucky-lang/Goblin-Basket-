import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { FaShoppingBasket } from "react-icons/fa";
import { VscLoading } from "react-icons/vsc";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <VscLoading className="h-8 w-8 animate-spin text-[#2E6327]" />
        <p className="font-heading text-base text-[#3D443E]">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5E4] text-[#2E6327]">
          <FaShoppingBasket className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">No Orders Yet</h2>
        <p className="text-sm text-[#3D443E]">You haven't placed any orders in your Goblin Basket.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-full bg-[#2E6327] px-6 py-2.5 font-heading text-sm font-bold text-white shadow-xs hover:bg-[#224b1d] transition-all"
        >
          Browse Restaurants 🧺
        </button>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
        My Orders 🧺
      </h1>

      {/* Active Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E6DF] pb-2">
          <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">
            Active Orders
          </h2>
          <span className="rounded-full bg-[#8FD14F] px-2.5 py-0.5 text-xs font-bold text-[#1C1A17]">
            {activeOrders.length}
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <p className="text-sm text-[#3D443E]">No active orders right now.</p>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                isActive={true}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E6DF] pb-2">
          <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">
            Past Orders
          </h2>
          <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-[#3D443E]">
            {completedOrders.length}
          </span>
        </div>

        {completedOrders.length === 0 ? (
          <p className="text-sm text-[#3D443E]">No past orders.</p>
        ) : (
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                isActive={false}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;

// Order Row Component
const OrderRow = ({
  order,
  isActive,
  onClick,
}: {
  order: IOrder;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`cursor-pointer rounded-2xl bg-white p-5 border border-[#E2E6DF] shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#8FD14F]/50 ${
        isActive ? "border-l-4 border-l-[#2E6327]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <p className="font-heading font-bold text-[#1A1A1A]">
          Order #{order._id.slice(-6).toUpperCase()}
        </p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
            isActive
              ? "bg-[#EAF5E4] text-[#2E6327]"
              : "bg-gray-100 text-[#3D443E]"
          }`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-2 text-xs sm:text-sm text-[#3D443E]">
        {order.items.map((item, i) => (
          <span key={i}>
            {item.name} x <strong>{item.quauntity}</strong>
            {i < order.items.length - 1 && ", "}
          </span>
        ))}
      </div>

      <div className="mt-3 flex justify-between items-center pt-2 border-t border-[#E2E6DF]/60 text-sm">
        <span className="text-xs text-[#3D443E]">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
        <span className="font-heading font-extrabold text-[#2E6327] text-base">
          ₹{order.totalAmount}
        </span>
      </div>
    </div>
  );
};
