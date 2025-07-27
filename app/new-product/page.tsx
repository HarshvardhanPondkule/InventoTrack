"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "../types";
import { createProduct, readCategories } from "../actions";
import { FileImage } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: "",
    unit: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      if (email) {
        const data = await readCategories(email);
        if (data) setCategories(data);
      }
    };
    fetchCategories();
  }, [email]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    const { name, description, price, quantity, categoryId, unit } = formData;

    if (!name || !description || !price || !quantity || !categoryId || !unit) {
      toast.error("Please fill all the form fields.");
      return;
    }

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    try {
      const imageData = new FormData();
      imageData.append("file", file);
      imageData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: imageData,
        }
      );

      const uploadData = await uploadRes.json();

      if (!uploadData.secure_url) {
        throw new Error("Image upload failed");
      }

      formData.imageUrl = uploadData.secure_url;

      await createProduct(formData, email);
      toast.success("Product created successfully");
      router.push("/products");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Wrapper>
      <div className="flex justify-center items-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Create a Product</h1>

          <section className="flex md:flex-row flex-col gap-6">
            {/* Form Section */}
            <div className="space-y-4 flex-1">
              {/* Form Fields */}
              <div>
                <label className="block font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    className="input input-bordered w-full"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="w-1/2">
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="input input-bordered w-full"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  className="select select-bordered w-full"
                  value={formData.categoryId}
                  onChange={handleChange}
                  name="categoryId"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Unit</label>
                <select
                  className="select select-bordered w-full"
                  value={formData.unit}
                  onChange={handleChange}
                  name="unit"
                >
                  <option value="">Select unit</option>
                  <option value="g">Gram</option>
                  <option value="kg">Kilogram</option>
                  <option value="l">Litre</option>
                  <option value="m">Meter</option>
                  <option value="cm">Centimeter</option>
                  <option value="h">Hour</option>
                  <option value="pcs">Pieces</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="btn btn-primary w-full mt-4"
              >
                Create Product
              </button>
            </div>

            {/* Image Preview Section */}
            <div className="border-2 border-primary md:h-[300px] md:w-[300px] p-5 flex justify-center items-center rounded-3xl">
              {previewUrl ? (
                <ProductImage
                  src={previewUrl}
                  alt="preview"
                  heightClass="h-40"
                  widthClass="w-40"
                />
              ) : (
                <div className="wiggle-animation">
                  <FileImage strokeWidth={1} className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
