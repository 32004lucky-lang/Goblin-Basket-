import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { FaShoppingBasket, FaUtensils, FaTruck, FaSmile } from "react-icons/fa";
import { VscLoading } from "react-icons/vsc";

const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  if (loading || !location) {
    return (
      <div className="flex h-[65vh] flex-col items-center justify-center gap-3">
        <VscLoading className="h-10 w-10 animate-spin text-[#2E6327]" />
        <p className="font-heading text-lg font-medium text-[#3D443E]">
          Finding delicious restaurants near you... 🧺
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Banner Section (matches design spec) */}
      {!search && (
        <section className="relative overflow-hidden bg-[#1C1A17] text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="max-w-xl space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <img src="/logo.png" alt="Goblin Mascot" className="h-16 w-16 object-contain drop-shadow-md" />
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2E6327]/80 px-4 py-1.5 text-xs font-bold text-[#8FD14F] backdrop-blur-xs border border-[#8FD14F]/30">
                  <FaShoppingBasket className="h-3.5 w-3.5" />
                  <span>Fastest Delivery in Town</span>
                </div>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                Delivered Fresh & <span className="text-[#8FD14F]">Gourmet Food</span>
              </h1>
              <p className="text-base text-gray-300 font-medium tracking-wide">
                Food you love, delivered right to your doorstep by your friendly Goblin!
              </p>
              <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
                <a
                  href="#restaurants"
                  className="rounded-full bg-[#8FD14F] px-8 py-3.5 font-heading text-base font-bold text-[#1C1A17] shadow-lg hover:bg-[#7DBB3A] transition-all hover:scale-105 active:scale-95"
                >
                  Order Now! 🧺
                </a>
              </div>
            </div>

            {/* Right Banner Image */}
            <div className="relative w-full max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C98B2C]/30">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
                  alt="Gourmet Burger"
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                  <div>
                    <span className="font-heading font-bold text-lg">Basket Deals</span>
                    <p className="text-xs text-gray-300">Up to 30% OFF on gourmet burgers</p>
                  </div>
                  <span className="rounded-full bg-[#D95D24] px-3 py-1 font-heading text-xs font-bold">
                    HOT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div id="restaurants" className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#E2E6DF] pb-4">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              {search ? `Search results for "${search}"` : "Nearby Restaurants"}
            </h2>
            <p className="text-xs sm:text-sm text-[#3D443E]">
              Freshly prepared meals ready for fast delivery
            </p>
          </div>
          <span className="rounded-full bg-[#EAF5E4] px-3.5 py-1.5 font-heading text-xs font-bold text-[#2E6327]">
            {restaurants.length} Available
          </span>
        </div>

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {restaurants.map((res) => {
              const [resLng, resLat] = res.autoLocation.coordinates;

              const distance = getDistanceKm(
                location.latitude,
                location.longitude,
                resLat,
                resLng
              );

              return (
                <RestaurantCard
                  key={res._id}
                  id={res._id}
                  name={res.name}
                  image={res.image ?? ""}
                  distance={`${distance}`}
                  isOpen={res.isOpen}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center border border-[#E2E6DF] space-y-3">
            <FaShoppingBasket className="mx-auto h-12 w-12 text-[#C98B2C]" />
            <h3 className="font-heading text-xl font-bold text-[#1A1A1A]">
              No restaurants found
            </h3>
            <p className="text-sm text-[#3D443E]">
              Try searching for something else or expanding your area.
            </p>
          </div>
        )}

        {/* How It Works Feature Ribbon */}
        {!search && (
          <section className="mt-12 rounded-3xl bg-[#EAF5E4] p-8 border border-[#2E6327]/20">
            <h3 className="font-heading text-center text-2xl font-bold text-[#1A1A1A] mb-8">
              How Goblin Basket Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-[#E2E6DF]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E6327] text-white mb-3">
                  <FaUtensils className="h-6 w-6 text-[#8FD14F]" />
                </div>
                <h4 className="font-heading font-bold text-base text-[#1A1A1A]">1. Choose Your Feast</h4>
                <p className="text-xs text-[#3D443E] mt-1">Browse menus from top rated local restaurants.</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-[#E2E6DF]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E6327] text-white mb-3">
                  <FaTruck className="h-6 w-6 text-[#8FD14F]" />
                </div>
                <h4 className="font-heading font-bold text-base text-[#1A1A1A]">2. Speedy Delivery</h4>
                <p className="text-xs text-[#3D443E] mt-1">Our riders rush to bring your food hot and fresh.</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-[#E2E6DF]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E6327] text-white mb-3">
                  <FaSmile className="h-6 w-6 text-[#8FD14F]" />
                </div>
                <h4 className="font-heading font-bold text-base text-[#1A1A1A]">3. Enjoy Every Bite</h4>
                <p className="text-xs text-[#3D443E] mt-1">Unpack your Goblin Basket & relish your meal!</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
