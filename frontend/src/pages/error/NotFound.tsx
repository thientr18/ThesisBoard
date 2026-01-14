import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { Ghost } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen w-full flex items-center justify-center
        bg-gradient-to-br from-blue-100 via-white to-purple-100
        "
    >
      <div
        className="
          bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 sm:p-12
          flex flex-col items-center w-full max-w-md
          animate-fade-in-up
        "
      >
        <div className="mb-4">
          <Ghost size={56} className="text-blue-400 drop-shadow" />
        </div>
        <Result
          status="404"
          title={<span className="text-3xl font-bold text-blue-900">404</span>}
          subTitle={
            <span className="text-gray-600">
              Sorry, the page you visited does not exist.
            </span>
          }
          extra={
            <Button
              type="primary"
              size="large"
              className="mt-4"
              onClick={() => {
                // You can replace this with: navigate("/") if using react-router
                navigate("/");
                // Or just: console.log("Back Home clicked");
              }}
            >
              Back Home
            </Button>
          }
        />
      </div>
      {/* Tailwind custom animation */}
      <style>
        {`
          .animate-fade-in-up {
            animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;