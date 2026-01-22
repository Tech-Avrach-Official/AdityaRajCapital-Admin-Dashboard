import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "@/global_redux/features/counter/counterSlice";
import Navbar from "@/components/common/Navbar";
import toast from "react-hot-toast";

const Home = () => {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.counter.value);

  const handleIncrement = () => {
    dispatch(increment());
    toast.success("Counter increased!");
  };

  const handleDecrement = () => {
    dispatch(decrement());
    toast.error("Counter decreased!");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Counter App
          </h1>

          <div className="text-6xl font-extrabold text-blue-600 mb-8">
            {count}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDecrement}
              className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold
                         hover:bg-red-600 active:scale-95 transition"
            >
              −
            </button>

            <button
              onClick={handleIncrement}
              className="px-6 py-3 rounded-lg bg-green-500 text-white font-semibold
                         hover:bg-green-600 active:scale-95 transition"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
