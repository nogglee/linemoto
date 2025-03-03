import React, {useEffect} from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessIcon from "../../../assets/icons/ico-toast-success.svg"; 
import FailIcon from "../../../assets/icons/ico-toast-fail.svg";

export const showToast = (message, type = "success") => {

  const toastId = toast(
    <div className="flex items-center gap-2.5">
      <img 
        src={type === "success" ? SuccessIcon : FailIcon} 
        alt="icon" 
        className="w-8 h-8"
      />
      <span>{message}</span>
    </div>,
    {
      progressClassName: "hidden",
      hideProgressBar: true,
      position: "top-center",
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      closeButton: false,
    }
  );

  setTimeout(() => {
    toast.dismiss(toastId);
  }, 2000);
};