import { useEffect } from "react";

export const AlertSnackbar = ({
  message,
  show,
  setShow,
  timeout,
}: {
  message: string;
  show: boolean;
  setShow: (show: boolean) => void;
  timeout?: number;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, timeout ?? 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, setShow]);

  if (!show) return null;
  return (
    <div
      className={`fixed top-0 mt-[100px] mr-4 right-5 bg-[#EB1717] text-white text-sm rounded-lg px-4 py-3 shadow-lg`}
    >
      {message}
    </div>
  );
};
