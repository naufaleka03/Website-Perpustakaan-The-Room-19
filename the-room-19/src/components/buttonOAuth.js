import React from 'react';
import { FcGoogle } from 'react-icons/fc'; // Pastikan menginstall react-icons

const ButtonOAuth = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full max-w-[300px] 
                 bg-white hover:bg-gray-50 text-gray-700 font-small
                 py-[12.5px] px-[48px] border border-gray-300 rounded-full
                 transition-all duration-200 ease-in-out"
    >
      <FcGoogle className="text-xl" />
      <span>Continue with Google</span>
    </button>
  );
};

export default ButtonOAuth;