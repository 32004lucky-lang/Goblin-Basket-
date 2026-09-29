import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch, BiMenu, BiX } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, quauntity } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <header className="w-full bg-white border-b border-[#E2E6DF] sticky top-0 z-40 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link
          to={"/"}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="Goblin Basket Logo"
            className="h-11 w-11 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-bold font-heading tracking-tight">
              <span className="text-[#2E6327]">Goblin</span>{" "}
              <span className="text-[#1A1A1A]">Basket</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-[#C98B2C] hidden sm:block">
              Food you love, delivered.
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to={"/cart"}
            className="relative flex items-center justify-center p-2 rounded-xl text-[#2E6327] hover:bg-[#EAF5E4] transition-colors"
            title="Cart"
          >
            <CgShoppingCart className="h-6 w-6" />
            {quauntity > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8FD14F] text-xs font-bold text-[#1C1A17] shadow-xs animate-in zoom-in duration-150">
                {quauntity}
              </span>
            )}
          </Link>

          {isAuth ? (
            <Link
              to="/account"
              className="hidden sm:inline-flex rounded-full bg-[#2E6327] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#224b1d] transition-all duration-200 active:scale-95"
            >
              Account
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex rounded-full bg-[#2E6327] px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#224b1d] transition-all duration-200 active:scale-95"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-[#2E6327] hover:bg-[#EAF5E4] transition-colors"
          >
            {isMobileMenuOpen ? <BiX className="h-6 w-6" /> : <BiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E2E6DF] bg-white px-4 py-3 space-y-3">
          {isAuth ? (
            <>
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 font-medium text-[#1A1A1A] hover:bg-[#F8F6F0]"
              >
                Your Orders
              </Link>
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 font-medium text-[#1A1A1A] hover:bg-[#F8F6F0]"
              >
                My Account
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center rounded-full bg-[#2E6327] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#224b1d] transition-all"
            >
              Login
            </Link>
          )}
        </div>
      )}

      {/* Search Bar Section */}
      {isHomePage && (
        <div className="border-t border-[#E2E6DF]/60 bg-[#F8F6F0] px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center rounded-xl bg-white border border-[#E2E6DF] shadow-xs focus-within:border-[#2E6327] focus-within:ring-2 focus-within:ring-[#2E6327]/20 transition-all">
            <div className="flex items-center gap-2 px-3 py-2 border-r border-[#E2E6DF] text-[#3D443E]">
              <BiMapPin className="h-5 w-5 text-[#2E6327] shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate max-w-28 sm:max-w-40">
                {city || "Set Location"}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <BiSearch className="h-5 w-5 text-[#C98B2C] shrink-0" />
              <input
                type="text"
                placeholder="Search for dishes, burgers, or restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs sm:text-sm outline-none bg-transparent text-[#1A1A1A] placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
