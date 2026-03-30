import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { addToWishlist, removeFromWishlist } from "../../api/apiService";
import { useAuth } from "../../contexts/AuthContext";

const getItemProductId = (item) => item?.product?.id || item?.product || item?.product_id;

/* ─── Bubble-style button classes ─── */
const bubbleBase =
  "relative overflow-hidden bg-gradient-to-b from-gray-500 to-gray-800 " +
  "shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] " +
  "ring-1 ring-gray-600 text-white transition-all " +
  "hover:from-gray-400 hover:to-gray-700 hover:scale-105 active:scale-95";

/* ═══════════════════════════════════════════════════════════════╗
   MAIN PRODUCT PAGE BUTTON
   – Large round bubble with animated ripple on click
╚════════════════════════════════════════════════════════════════*/
export const WishlistButtonLarge = ({ product, className = "" }) => {
  const { user, login } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    if (!user || !product?.id) {
      setIsWishlisted(false);
      return;
    }

    const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
    setIsWishlisted(wishlist.some((item) => getItemProductId(item) === product.id));
  }, [product?.id, user]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || !product?.id) return;
    if (!user) { toast.error("Please login to manage your wishlist"); return; }

    /* ripple animation */
    setRipple(true);
    setTimeout(() => setRipple(false), 500);

    setLoading(true);
    try {
      const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
      let updatedWishlist;

      if (isWishlisted) {
        await removeFromWishlist(product.id);
        updatedWishlist = wishlist.filter((item) => getItemProductId(item) !== product.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        const response = await addToWishlist(product.id);
        updatedWishlist = [
          ...wishlist.filter((item) => getItemProductId(item) !== product.id),
          response.data,
        ];
        setIsWishlisted(true);
        toast.success("Added to wishlist ♥");
      }

      const updatedUser = { ...user, wishlist: updatedWishlist };
      login(updatedUser);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error updating wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      className={`
        ${bubbleBase}
        w-12 h-12 rounded-full flex items-center justify-center
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* Ripple */}
      {ripple && (
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping pointer-events-none" />
      )}

      {/* Heart icon – outline when not wishlisted, filled when wishlisted */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`w-5 h-5 transition-transform duration-300 ${isWishlisted ? "scale-110" : "scale-100"}`}
        fill={isWishlisted ? "white" : "none"}
        stroke="white"
        strokeWidth={isWishlisted ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════╗
   PRODUCT CARD SMALL BUTTON  (used in ProductGrid)
   – Compact, always visible top-right corner of card
╚════════════════════════════════════════════════════════════════*/
const WishlistButton = ({ product, className = "" }) => {
  const { user, login } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    if (!user || !product?.id) {
      setIsWishlisted(false);
      return;
    }

    const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
    setIsWishlisted(wishlist.some((item) => getItemProductId(item) === product.id));
  }, [product?.id, user]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || !product?.id) return;
    if (!user) { toast.error("Please login to manage your wishlist"); return; }

    setRipple(true);
    setTimeout(() => setRipple(false), 500);

    setLoading(true);
    try {
      const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
      let updatedWishlist;

      if (isWishlisted) {
        await removeFromWishlist(product.id);
        updatedWishlist = wishlist.filter((item) => getItemProductId(item) !== product.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        const response = await addToWishlist(product.id);
        updatedWishlist = [
          ...wishlist.filter((item) => getItemProductId(item) !== product.id),
          response.data,
        ];
        setIsWishlisted(true);
        toast.success("Added to wishlist ♥");
      }

      const updatedUser = { ...user, wishlist: updatedWishlist };
      login(updatedUser);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error updating wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      className={`
        ${bubbleBase}
        w-8 h-8 rounded-full flex items-center justify-center
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {ripple && (
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping pointer-events-none" />
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? "scale-110" : "scale-100"}`}
        fill={isWishlisted ? "white" : "none"}
        stroke="white"
        strokeWidth={isWishlisted ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;
