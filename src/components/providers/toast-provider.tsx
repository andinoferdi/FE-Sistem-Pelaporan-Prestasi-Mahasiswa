"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastProvider = () => {
  const pathname = usePathname();

  useEffect(() => {
    toast.dismiss();
  }, [pathname]);

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3500}
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      draggable
      newestOnTop
      limit={3}
      theme="light"
    />
  );
};

