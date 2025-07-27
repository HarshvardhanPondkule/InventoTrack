"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

// Removed unused 'FileImage' import

// Replace these with your actual relative paths if different
import { readProductById, updateProduct } from "../../actions"; // Adjust path as needed
import ProductImage from "../../components/ProductImage";       // Adjust path as needed
import Wrapper from "../../components/Wrapper";                 // Adjust path as needed

// Define FormDataType and Product inline if you don't have the types module
type FormDataType = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
  categoryName: string;
};

type Product = FormDataType; // or define properly as per your model

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    unit: "",
    imageUrl: "",
    categoryName: "",
  });

  const fetchProduct = useCallback(async () => {
    if (!email || !productId) return;
    try {
      const fetched = await readProductById(productId, email);
      if (fetched) {
        setProduct(fetched);
        setFormData({
          id: fetched.id,
          name: fetched.name,
          description: fetched.description,
          price: fetched.price,
          quantity: fetched.quantity ?? 0,
          unit: fetched.unit ?? "",
          imageUrl: fetched.imageUrl,
          categoryName: fetched.categoryName,
        });
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
    }
  }, [productId, email]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData.imageUrl;

    try {
      if (file) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: formData.imageUrl }),
        });

        const imageData = new FormData();
        imageData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: imageData,
        });

        const data = await res.json();
        if (!data.success) throw new Error("Image upload failed");

        imageUrl = data.path;
      }

      await updateProduct({ ...formData, imageUrl }, email!);
      toast.success("Product updated successfully!");
      router.push("/products");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error("Update error:", err);
      toast.error(message);
    }
  };

  return (
    <Wrapper>
      <div>
        {product ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Update Product</h1>
            <div className="flex md:flex-row flex-col md:items-start gap-6">
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
                <div>
                  <label className="block text-sm font-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Description</label>
                  <textarea
                    name="description"
                    className="textarea textarea-bordered w-full"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Category</label>
                  <input
                    type="text"
                    name="categoryName"
                    className="input input-bordered w-full"
                    value={formData.categoryName}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Image / Price / Quantity</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                      onChange={handleFileChange}
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price in ₹"
                      className="input input-bordered w-full"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Quantity"
                      className="input input-bordered w-full"
                      value={formData.quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-2">
                  Update
                </button>
              </form>

              <div className="flex flex-col gap-4">
                {[formData.imageUrl, previewUrl].map(
                  (src, idx) =>
                    src && (
                      <div
                        key={idx}
                        className="w-[200px] h-[200px] border-2 border-primary p-5 rounded-3xl flex items-center justify-center"
                      >
                        <ProductImage
                          src={src}
                          alt="Product"
                          heightClass="h-40"
                          widthClass="w-40"
                        />
                      </div>
                    )
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center w-full py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default Page;
