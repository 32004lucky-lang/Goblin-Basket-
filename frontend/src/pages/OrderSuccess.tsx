import axios from "axios";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = params.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;

      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, {
          sessionId,
        });

        toast.success("Payment successful 🎉");
      } catch (error) {
        toast.error("Stripe verification failed");
        console.log(error);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-3xl bg-white p-8 sm:p-12 border border-[#E2E6DF] shadow-md max-w-md w-full space-y-5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF5E4] text-[#2E6327]">
          <FaCheckCircle className="h-10 w-10 text-[#2E6327]" />
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
          Order Confirmed! 🧺
        </h1>

        <p className="text-sm text-[#3D443E]">
          Thank you for ordering with <strong className="text-[#2E6327]">Goblin Basket</strong>. Your food is being prepared with love!
        </p>

        <div className="pt-2 space-y-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full rounded-full bg-[#2E6327] py-3.5 font-heading text-sm font-bold text-white shadow-md hover:bg-[#224b1d] transition-all"
          >
            Track Your Order
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-full bg-[#F8F6F0] py-3 font-heading text-sm font-semibold text-[#1A1A1A] hover:bg-[#EAF5E4] transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
