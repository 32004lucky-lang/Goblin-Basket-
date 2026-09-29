import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response.data.message);
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };
  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs border border-[#2E6327]/30 space-y-3">
      <p className="text-center text-xs font-semibold text-[#D95D24]">
        Accept within {secondsLeft}s
      </p>

      <p className="text-center font-heading text-lg font-bold text-[#2E6327]">
        New Delivery Request
      </p>

      <p className="text-center text-sm text-[#3D443E]">
        Order ID: <b className="text-[#1A1A1A]">{orderId.slice(-6)}</b>
      </p>

      <button
        disabled={accepting}
        onClick={acceptOrder}
        className="w-full rounded-full bg-[#2E6327] py-3 text-sm font-bold text-white shadow-md hover:bg-[#224b1d] disabled:opacity-50 transition-all active:scale-95"
      >
        {accepting ? "Accepting..." : "Accept order"}
      </button>
    </div>
  );
};

export default RiderOrderRequest;
