import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";

type Role = "customer" | "rider" | "seller" | null;
const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/", { replace: true });
    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 border border-[#E2E6DF] shadow-md space-y-6 text-center">
        <img src="/logo.png" alt="Goblin Basket Logo" className="mx-auto h-16 w-16 object-contain" />

        <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
          Choose Your Role
        </h1>

        <div className="space-y-3">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`
                    w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold capitalize transition-all ${
                      role === r
                        ? "border-[#2E6327] bg-[#2E6327] text-white shadow-xs"
                        : "border-[#E2E6DF] bg-white text-[#1A1A1A] hover:bg-[#EAF5E4]/50"
                    }
                    `}
            >
              Continue as {r}
            </button>
          ))}
        </div>
        <button
          disabled={!role}
          onClick={addRole}
          className={`w-full rounded-full px-4 py-3 text-sm font-bold shadow-md transition-all ${
            role
              ? "bg-[#8FD14F] text-[#1C1A17] hover:bg-[#7DBB3A] active:scale-[0.99]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectRole;
