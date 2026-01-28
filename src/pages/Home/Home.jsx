import React from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/common/Navbar"
import { Button } from "@/components/ui/button"

const Home = () => {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            AdityaRaj Capital
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to the Admin Dashboard
          </p>

          <Button
            onClick={() => navigate("/admin")}
            className="w-full"
            size="lg"
          >
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    </>
  )
}

export default Home
