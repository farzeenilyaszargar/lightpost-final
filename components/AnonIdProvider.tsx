"use client";

import { useEffect } from "react";

// Helper to set a cookie
function setCookie(name: string, value: string, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Helper to get a cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default function AnonIdProvider() {
  useEffect(() => {
    let anonId = localStorage.getItem("anon_id");

    // If not in localStorage, check cookie
    if (!anonId) {
      anonId = getCookie("anon_id");
      if (anonId) {
        localStorage.setItem("anon_id", anonId);
      }
    }

    // If neither exists, generate a new ID
    if (!anonId) {
      anonId = "anon_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("anon_id", anonId);
      setCookie("anon_id", anonId);
      console.log("Generated new anon ID:", anonId);
    } else {
      console.log("Existing anon ID found:", anonId);
    }
  }, []);

  return null; // doesn't render anything
}
