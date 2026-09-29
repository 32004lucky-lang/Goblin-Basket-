import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      alert("Name price and image is required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item added successfully");
      resetForm();
      onItemAdded();
    } catch (error) {
      console.log(error);
      toast.error("failed to add item");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md space-y-4 m-auto rounded-2xl bg-white p-6 shadow-xs border border-[#E2E6DF]">
      <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">Add Menu Item</h2>
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-[#E2E6DF] px-4 py-2.5 text-sm outline-none focus:border-[#2E6327]"
      />
      <textarea
        placeholder="Item description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border border-[#E2E6DF] px-4 py-2.5 text-sm outline-none focus:border-[#2E6327]"
        rows={3}
      />
      <input
        type="number"
        placeholder="Price ₹"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-xl border border-[#E2E6DF] px-4 py-2.5 text-sm outline-none focus:border-[#2E6327]"
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E6DF] p-4 text-sm text-[#3D443E] hover:bg-[#F8F6F0]">
        <BiUpload className="h-5 w-5 text-[#2E6327]" />
        {image ? image.name : "Upload item image"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </label>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full rounded-full bg-[#2E6327] py-3 text-sm font-bold text-white shadow-md hover:bg-[#224b1d] transition-all disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
};

export default AddMenuItem;
