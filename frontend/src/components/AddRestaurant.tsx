import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant added successfully! 🧺");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-8">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-md border border-[#E2E6DF] space-y-5">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Goblin Basket Logo" className="mx-auto h-16 w-16 object-contain" />
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            Partner with Goblin Basket
          </h1>
          <p className="text-xs text-[#3D443E]">
            Add your restaurant to reach hungry food lovers
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Goblin Burger Joint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#E2E6DF] px-4 py-2.5 text-sm outline-none focus:border-[#2E6327]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Contact Number
            </label>
            <input
              type="number"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#E2E6DF] px-4 py-2.5 text-sm outline-none focus:border-[#2E6327]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Description
            </label>
            <textarea
              placeholder="Tell customers what makes your food special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#E2E6DF] px-4 py-2.5 text-sm outline-none focus:border-[#2E6327]"
              rows={3}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#2E6327]/50 p-4 text-sm text-[#3D443E] hover:bg-[#EAF5E4]/50 transition-colors">
            <BiUpload className="h-5 w-5 text-[#2E6327]" />
            <span className="truncate">{image ? image.name : "Upload Cover Image"}</span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <div className="flex items-start gap-3 rounded-xl border border-[#E2E6DF] p-3.5 bg-[#F8F6F0]">
            <BiMapPin className="mt-0.5 h-5 w-5 text-[#2E6327] shrink-0" />
            <div className="text-xs text-[#3D443E]">
              {loadingLocation
                ? "Fetching location..."
                : location?.formattedAddress || "Location not available"}
            </div>
          </div>
        </div>

        <button
          className="w-full rounded-full py-3.5 text-sm font-bold font-heading text-white bg-[#2E6327] hover:bg-[#224b1d] shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Registering..." : "Add Restaurant 🧺"}
        </button>
      </div>
    </div>
  );
};

export default AddRestaurant;
