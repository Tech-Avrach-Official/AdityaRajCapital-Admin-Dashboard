import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { UserCog, Handshake, Shield } from "lucide-react"

/**
 * Role landing - shown at /. Options: Sub-admin, RM, Partner login.
 */
const RoleLandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          AdityaRaj Capital
        </h1>
        <p className="text-gray-600 mb-8">Choose how you want to sign in</p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/admin")}
            className="w-full"
            size="lg"
            variant="default"
          >
            <Shield className="h-5 w-5 mr-2" />
            Sub-admin login
          </Button>
          <Button
            onClick={() => navigate("/rm/login")}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            <UserCog className="h-5 w-5 mr-2" />
            Login as RM
          </Button>
          <Button
            onClick={() => navigate("/partner/login")}
            className="w-full"
            size="lg"
            variant="outline"
          >
            <Handshake className="h-5 w-5 mr-2" />
            Login as Partner
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RoleLandingPage
