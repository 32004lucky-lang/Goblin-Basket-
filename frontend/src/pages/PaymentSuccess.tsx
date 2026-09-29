import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 border border-[#E2E6DF] shadow-md text-center space-y-5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF5E4] text-[#2E6327]">
          <BiCheckCircle className="h-12 w-12 text-[#2E6327]" />
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-[#1A1A1A]">
          Payment Successful! 🧺
        </h1>

        <p className="text-sm text-[#3D443E]">
          Your payment was processed and your order is on its way!
        </p>

        {paymentId && (
          <div className="rounded-xl bg-[#F8F6F0] p-3 text-xs border border-[#E2E6DF]">
            <span className="text-[#3D443E] font-semibold">Payment ID: </span>
            <p className="font-mono text-[#2E6327] font-bold break-all mt-0.5">{paymentId}</p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2E6327] py-3.5 font-heading text-sm font-bold text-white shadow-md hover:bg-[#224b1d] transition-all"
            onClick={() => navigate("/orders")}
          >
            Track Your Orders <BsArrowRight size={16} />
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8FD14F] py-3 font-heading text-sm font-bold text-[#1C1A17] hover:bg-[#7DBB3A] transition-all"
            onClick={() => navigate("/")}
          >
            Order More Food 🧺 <BsArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
