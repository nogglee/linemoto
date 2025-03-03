import React, {useEffect} from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessIcon from "../../../assets/icons/ico-toast-success.svg"; 
import FailIcon from "../../../assets/icons/ico-toast-fail.svg";

export const showToast = (message, type = "success") => {

  const toastId = toast(
    <div className="flex items-center gap-2">
      <img 
        src={type === "success" ? SuccessIcon : FailIcon} 
        alt="icon" 
        className="w-7 h-7"
      />
      <span>{message}</span>
    </div>,
    {
      className: "bg-gray-800 text-white rounded-2xl px-4 py-3 flex items-center",
      bodyClassName: "text-sm font-medium",
      progressClassName: "hidden",
      hideProgressBar: true,
      position: "top-center",
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    }
  );

  setTimeout(() => {
    toast.dismiss(toastId);
  }, 2000);
};