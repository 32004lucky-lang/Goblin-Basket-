import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join", `user:${id}`);

    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ latitude, longitude }: any) => {
      console.log("Rider Location:", latitude, longitude);
      setRiderLocation([latitude, longitude]);
    };

    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading order...</p>;
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">No order Found</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E6DF] pb-4">
        <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
          Order #{order._id.slice(-6)}
        </h1>
        <div className="inline-flex rounded-full bg-[#EAF5E4] px-4 py-1.5 text-sm font-bold text-[#2E6327] border border-[#2E6327]/20 w-fit">
          Status: <span className="capitalize ml-1">{order.status.replace("_", " ")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-xs border border-[#E2E6DF] space-y-3">
            <h2 className="font-heading text-lg font-bold text-[#1A1A1A] border-b border-[#E2E6DF] pb-2">Items</h2>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div className="flex justify-between text-sm text-[#3D443E]" key={i}>
                  <span>
                    {item.name} <strong className="text-[#1A1A1A]">x {item.quauntity}</strong>
                  </span>
                  <span className="font-semibold text-[#1A1A1A]">₹{item.price * item.quauntity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xs border border-[#E2E6DF] space-y-2">
            <h2 className="font-heading text-lg font-bold text-[#1A1A1A] border-b border-[#E2E6DF] pb-2">Delivery Address</h2>
            <p className="text-sm text-[#3D443E] mt-2">
              {order.deliveryAddress.fromattedAddress}
            </p>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Mobile: {order.deliveryAddress.mobile}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-[#E2E6DF] space-y-3 h-fit">
          <h2 className="font-heading text-lg font-bold text-[#1A1A1A] border-b border-[#E2E6DF] pb-2">Bill Summary</h2>
          <div className="space-y-2 text-sm text-[#3D443E]">
            <div className="flex justify-between">
              <span>Subtotal</span> <span className="font-semibold text-[#1A1A1A]">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span> <span className="font-semibold text-[#1A1A1A]">₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span> <span className="font-semibold text-[#1A1A1A]">₹{order.platfromFee}</span>
            </div>
          </div>
          
          <div className="flex justify-between text-base font-heading font-extrabold text-[#1A1A1A] border-t border-[#E2E6DF] pt-3">
            <span>Total</span> <span className="text-[#2E6327]">₹{order.totalAmount}</span>
          </div>

          <div className="mt-4 rounded-xl bg-[#F8F6F0] p-3 text-xs text-[#3D443E] border border-[#E2E6DF]">
            <p><strong>Payment Method:</strong> <span className="capitalize">{order.paymentMethod}</span></p>
            <p><strong>Payment Status:</strong> <span className="capitalize text-[#2E6327] font-semibold">{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>

      {(order.status === "rider_assigned" || order.status === "picked_up") &&
        (riderLocation ? (
          <UserOrderMap
            riderLocation={riderLocation}
            deliveryLocation={[
              order.deliveryAddress.latitude!,
              order.deliveryAddress.longitude!,
            ]}
          />
        ) : (
          <p>Waiting for rider location</p>
        ))}
    </div>
  );
};

export default OrderPage;
