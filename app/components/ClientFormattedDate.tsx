/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export function ClientFormattedDate({ date }: { date: Date | string | null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !date) {
    return null;
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const text = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return <>{text}</>;
}
