import React from "react";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
  size: number;
  className?: string;
  loading?: boolean;
}

const Button: React.FC<Props> = ({
  children,
  onClick,
  color,
  size,
  className,
  loading,
}) => {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <button
        className={`w-full h-full rounded-full border-none cursor-pointer flex absolute justify-center items-center bottom-5 right-5 z-[1000] p-1 ${color}`}
        onClick={onClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} color="black" />
        ) : (
          children
        )}
      </button>
    </div>
  );
};

export default Button;
