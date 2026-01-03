// e-commerce/frontend/components/landing/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import logo from "../../public/urban-yuan.png";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  ShoppingBag,
  Home,
  Package,
  Info,
  Phone,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock?: number;
};

const navigation = [
  { name: "Home", href: "#home", icon: Home },
  { name: "Products", href: "#products", icon: Package },
  { name: "Features", href: "#features", icon: Info },
  { name: "Orders", href: "/orders", icon: Package },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPopupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    user,
    profile,
    signOut,
    cartTotalItems,
    isAddingToCart,
    clearCartAnimation,
  } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle cart animation when adding to cart
  useEffect(() => {
    if (isAddingToCart) {
      setIsCartAnimating(true);
      const timer = setTimeout(() => {
        setIsCartAnimating(false);
        clearCartAnimation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAddingToCart, clearCartAnimation]);

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchPopupRef.current &&
        !searchPopupRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchPopup(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log("Searching for:", query);
      const res = await fetch(`http://localhost:4000/public/products`);

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      // Handle both array and object with products property
      let products = [];
      if (Array.isArray(data)) {
        products = data;
      } else if (data && Array.isArray(data.products)) {
        products = data.products;
      } else if (data && Array.isArray(data.data)) {
        products = data.data;
      }

      if (products.length > 0) {
        const filtered = products
          .filter(
            (product: Product) =>
              (product.name &&
                product.name.toLowerCase().includes(query.toLowerCase())) ||
              (product.description &&
                product.description.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 5); // Limit to 5 results for popup

        console.log("Filtered results:", filtered);
        setSearchResults(filtered);
        setShowSearchPopup(true);
      } else {
        console.log("No products found in response");
        setSearchResults([]);
        setShowSearchPopup(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowSearchPopup(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(
          `/products?search=${encodeURIComponent(searchQuery.trim())}`
        );
        setShowSearchPopup(false);
        setSearchQuery("");
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setShowSearchPopup(false);
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowSearchPopup(true);
    }
  };

  const handleSearchInputClick = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowSearchPopup(true);
    }
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchPopup(false);
      setSearchQuery("");
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigation.map((item) => item.href.replace("#", ""));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      const offset = 80; // Navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setIsMenuOpen(false);
  };

  const linkClass = (href: string) => {
    const sectionId = href.replace("#", "");
    const isActive = activeSection === sectionId;

    return `px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
      isActive
        ? "bg-red-700 text-white shadow-sm"
        : "text-red-200 hover:bg-red-800 hover:text-white"
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-linear-to-br from-red-900 to-red-950 border-b border-red-800/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT - Brand & Navigation */}
          <div className="flex items-center gap-8">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-4">
              <div className="bg-white rounded-lg flex items-center justify-center">
                <Image
                  src={logo}
                  alt="UrbanYuan"
                  className="w-14"
                />
              </div>
              <span className="font-bold text-xl text-red-50">UrbanYuan</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return item.href.startsWith("#") ? (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className={linkClass(item.href)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={linkClass(item.href)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT - Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-red-300" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                onFocus={handleSearchFocus}
                onClick={handleSearchInputClick}
                disabled={isSearching}
                className="block w-64 pl-10 pr-3 py-2 bg-red-800/30 border border-red-700/50 rounded-lg text-red-100 placeholder-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />

              {/* Search Popup */}
              {showSearchPopup && (
                <div
                  ref={searchPopupRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Rp {product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 px-4 py-2">
                        <button
                          onClick={handleViewAllResults}
                          className="text-red-600 hover:text-red-700 text-sm font-medium w-full text-left"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="p-4 text-center text-gray-500">
                      No products found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cart Button with Animation */}
            <Link href="/cart">
              <Button
                size="sm"
                className={`relative bg-red-700 hover:bg-red-600 text-white transition-all duration-300 ${
                  isCartAnimating ? "scale-110 bg-red-500" : ""
                }`}
              >
                <ShoppingCart
                  className={`w-4 h-4 transition-all duration-300 ${
                    isCartAnimating ? "animate-bounce" : ""
                  }`}
                />
                <span
                  className={`absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                    isCartAnimating ? "scale-125 bg-red-500" : ""
                  }`}
                >
                  {cartTotalItems}
                </span>

                {/* Flying Cart Animation */}
                {isAddingToCart && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -left-4 -top-4 w-8 h-8">
                      <ShoppingCart className="w-4 h-4 text-white animate-fly-to-cart" />
                    </div>
                  </div>
                )}
              </Button>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="h-10 w-10 cursor-pointer border-2 border-red-600/50 hover:border-red-500 transition-colors">
                      {profile?.avatarUrl ? (
                        <AvatarImage
                          src={profile.avatarUrl}
                          alt={profile.fullName || "Profile"}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-red-700 text-white font-semibold">
                        {profile?.fullName
                          ? profile.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border-gray-200 shadow-xl"
                >
                  <DropdownMenuLabel className="text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">
                        {profile?.fullName || "User Account"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    onClick={() => router.push("/orders")}
                    className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/cart")}
                    className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    My Cart
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    size="sm"
                    className="bg-red-700 hover:bg-red-600 text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-red-700 hover:bg-red-600 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 text-red-100 hover:bg-red-800 hover:text-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-red-800/30 pt-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return item.href.startsWith("#") ? (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="text-red-200 hover:bg-red-800 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-red-200 hover:bg-red-800 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Search */}
              <div className="px-4 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-red-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    disabled={isSearching}
                    className="block w-full pl-10 pr-3 py-2 bg-red-800/30 border border-red-700/50 rounded-lg text-red-100 placeholder-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="px-4 py-2 space-y-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="w-full">
                        <div className="text-red-200 text-sm px-4 py-2 flex items-center justify-between cursor-pointer bg-red-800/30 rounded-lg">
                          <span>
                            Hi, {profile?.fullName || user.email?.split("@")[0]}
                          </span>
                          <Avatar className="h-8 w-8 border-2 border-red-600/50">
                            {profile?.avatarUrl ? (
                              <AvatarImage
                                src={profile.avatarUrl}
                                alt={profile.fullName || "Profile"}
                              />
                            ) : null}
                            <AvatarFallback className="bg-red-700 text-white font-semibold text-sm">
                              {profile?.fullName
                                ? profile.fullName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : user.email?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white border-gray-200 shadow-xl"
                    >
                      <DropdownMenuLabel className="text-gray-900">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold">User Account</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator className="bg-gray-200" />

                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/orders");
                          setIsMenuOpen(false);
                        }}
                        className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/cart");
                          setIsMenuOpen(false);
                        }}
                        className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        My Cart
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => router.push("/profile")}
                        className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-gray-200" />

                      <DropdownMenuItem
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full bg-red-700 hover:bg-red-600 text-white"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full bg-red-700 hover:bg-red-600 text-white"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Cart */}
              <div className="px-4 py-2">
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="sm"
                    className={`w-full relative bg-red-700 hover:bg-red-600 text-white transition-all duration-300 ${
                      isCartAnimating ? "scale-110 bg-red-500" : ""
                    }`}
                  >
                    <ShoppingCart
                      className={`w-4 h-4 mr-2 transition-all duration-300 ${
                        isCartAnimating ? "animate-bounce" : ""
                      }`}
                    />
                    Cart
                    <span
                      className={`absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                        isCartAnimating ? "scale-125 bg-red-500" : ""
                      }`}
                    >
                      {cartTotalItems}
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
