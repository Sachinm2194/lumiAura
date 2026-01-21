"use client";
import { useEffect, useState } from "react";
import { GetWishlist } from "@/app/api/auth/wishlist";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getWishlist = async () => {
      setIsLoading(true);
      try {
        const data = await GetWishlist();
        setWishlist(data);
        console.log("Wishlist data:", data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getWishlist();
  }, []);

  return (
    <div>
      <h1>Wishlist</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Check console for wishlist data</p>
          <p>Items count: {Array.isArray(wishlist) ? wishlist.length : 0}</p>
        </div>
      )}
    </div>
  );
}
