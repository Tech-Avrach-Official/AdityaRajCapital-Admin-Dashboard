import { useNavigate } from "react-router-dom"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const NotAuthorizedPage = ({
  title = "You don't have permission",
  message = "Your account doesn't have access to this page. If you think this is a mistake, ask an administrator to grant you the required permission.",
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go back
            </Button>
            <Button onClick={() => navigate("/admin")}>Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotAuthorizedPage
