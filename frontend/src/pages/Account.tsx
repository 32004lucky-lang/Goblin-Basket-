import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "G";

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white border border-[#E2E6DF] shadow-md">
        <div className="flex items-center gap-4 border-b border-[#E2E6DF] p-6 bg-[#EAF5E4]/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2E6327] font-heading text-2xl font-bold text-white shadow-md">
            {firstLetter}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">
              {user?.name}
            </h2>
            <p className="text-xs text-[#3D443E]">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#2E6327]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2E6327]">
              Role: {user?.role || "Customer"}
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#E2E6DF]">
          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-[#F8F6F0] transition-colors"
            onClick={() => navigate("/orders")}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF5E4] text-[#2E6327]">
              <BiPackage className="h-5 w-5" />
            </div>
            <span className="font-semibold text-[#1A1A1A]">Your Orders</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-[#F8F6F0] transition-colors"
            onClick={() => navigate("/address")}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF5E4] text-[#2E6327]">
              <BiMapPin className="h-5 w-5" />
            </div>
            <span className="font-semibold text-[#1A1A1A]">Saved Addresses</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-orange-50 transition-colors text-[#D95D24]"
            onClick={logoutHandler}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#D95D24]">
              <BiLogOut className="h-5 w-5" />
            </div>
            <span className="font-semibold">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
