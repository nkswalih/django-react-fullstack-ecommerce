import React, { Fragment, useEffect, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../api/apiService";

const PopoverBodyLock = ({ open }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return null;
};

const SearchDropdown = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [quickLinks] = useState([
    { name: "Find a store", path: "/store" },
    { name: "Accessories", path: "/accessories" },
    { name: "Laptop", path: "/laptop" },
    { name: "Apple store", path: "/apple" },
    { name: "Support", path: "/support" },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length <= 1) {
      setSearchResults([]);
      return;
    }

    const searchProducts = async () => {
      try {
        const response = await getProducts();
        const products = Array.isArray(response.data) ? response.data : response.data?.products || [];
        const filtered = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setSearchResults(filtered.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    searchProducts();
  }, [searchQuery]);

  const handleProductClick = (productId, close) => {
    close();
    setTimeout(() => {
      navigate(`/product/${productId}`);
      setSearchQuery("");
    }, 100);
  };

  const handleQuickLinkClick = (path, close) => {
    close();
    setTimeout(() => {
      navigate(path);
      setSearchQuery("");
    }, 100);
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <PopoverBodyLock open={open} />

          <Popover.Button className="flex items-center py-2 text-gray-700 hover:text-gray-900">
            <MagnifyingGlassIcon className="size-5 stroke-gray-900" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="fixed top-16 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[18rem] sm:max-w-[24rem] lg:left-auto lg:translate-x-0 lg:right-8 lg:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="font-dm-sans">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search echoo.com"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="flex-1 bg-transparent font-bold outline-none text-lg"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-gray-100 rounded-full">
                      <XMarkIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {searchQuery ? (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.slug, close)}
                          className="w-full p-3 flex gap-3 hover:bg-gray-50 rounded-lg text-left"
                        >
                          <img
                            src={product.images?.[0]?.image_url || "https://via.placeholder.com/50x50"}
                            alt={product.name}
                            className="w-10 h-10 object-contain"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.brand} • {product.category}
                            </div>
                          </div>
                          <div className="font-semibold">Rs. {Number(product.price).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="text-sm font-semibold text-gray-500 mb-2">Quick Links</div>
                      {quickLinks.map((link) => (
                        <button
                          key={link.name}
                          onClick={() => handleQuickLinkClick(link.path, close)}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                        >
                          {link.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>

          {open && <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-md" onClick={close} />}
        </>
      )}
    </Popover>
  );
};

export default SearchDropdown;
