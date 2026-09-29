import { useNavigate } from "react-router-dom";
import { BiMap } from "react-icons/bi";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();
  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-2xl bg-white border border-[#E2E6DF] shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
        !isOpen ? "opacity-75" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#F8F6F0]">
        <img
          src={image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60"}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !isOpen ? "grayscale" : ""
          }`}
        />

        {/* Status Badge */}
        {!isOpen ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1C1A17]/60 backdrop-blur-xs">
            <span className="rounded-full bg-[#1C1A17] px-4 py-1.5 font-heading text-xs font-bold text-white shadow-md">
              Closed Now
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              Open
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="truncate font-heading text-lg font-bold text-[#1A1A1A] group-hover:text-[#2E6327] transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-[#3D443E]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5E4] px-2.5 py-1 font-semibold text-[#2E6327]">
            <BiMap className="h-3.5 w-3.5" />
            {distance} km away
          </span>

          <span className="text-[#C98B2C] font-semibold">
            ★ 4.8
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
