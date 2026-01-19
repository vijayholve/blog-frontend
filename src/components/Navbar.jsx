// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getStoredUser, logoutUser } from "@/lib/authApi";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = getStoredUser();
    setUser(userData);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6">
        <div className="max-w-7xl mx-auto py-3 sm:py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition flex-shrink-0"
          >
            MyBlog
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/"
              className="hover:text-blue-500 transition font-medium text-slate-900 text-sm lg:text-base"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="hover:text-blue-500 transition font-medium text-slate-900 text-sm lg:text-base"
            >
              Blog
            </Link>

            {user ? (
              <>
                <Link
                  href="/create"
                  className="hover:text-blue-500 transition font-medium text-slate-900 text-sm lg:text-base"
                >
                  Create Post
                </Link>

                {/* Desktop User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 hover:text-blue-500 transition px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900 text-sm">
                      {user.username}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform text-slate-900 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-slate-200">
                        <Link
                          href="/auth/profile"
                          className="block px-4 py-2 text-slate-800 hover:bg-blue-50 transition text-sm"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profile
                          </span>
                        </Link>
                        <Link
                          href="/User"
                          className="block px-4 py-2 text-slate-800 hover:bg-blue-50 transition text-sm"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            My Posts
                          </span>
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-2 text-blue-600 hover:text-blue-700 transition font-medium text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition"
          >
            <svg
              className={`w-6 h-6 text-slate-900 transition-transform ${
                mobileMenuOpen ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white py-4 px-4 space-y-3">
            <Link
              href="/"
              className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium text-slate-900 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium text-slate-900 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>

            {user ? (
              <>
                <Link
                  href="/create"
                  className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium text-slate-900 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Post
                </Link>

                {/* Mobile User Info */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex items-center space-x-3 px-4 py-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900 text-sm truncate">
                      {user.username}
                    </span>
                  </div>

                  <Link
                    href="/auth/profile"
                    className="block px-4 py-2 rounded-lg hover:bg-blue-50 transition text-slate-800 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </span>
                  </Link>
                  <Link
                    href="/User"
                    className="block px-4 py-2 rounded-lg hover:bg-blue-50 transition text-slate-800 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      My Posts
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 transition text-red-600 text-sm mt-2"
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition text-blue-600 font-medium text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
