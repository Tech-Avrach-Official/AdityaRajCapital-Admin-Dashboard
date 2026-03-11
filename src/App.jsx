// import { Home } from "lucide-react"
import { BrowserRouter } from "react-router-dom"
import AllRoutes from "./global/router/AppRouter"
import "./App.css";
import { Toaster } from "react-hot-toast";
// import TeezinesLoader from "./component/TeezinesLoader";
import ScrollToTop from "./components/common/scrollToTop";
const App = () => {

  return (
    <div>
      {/* <CategoryProvider> */}
        <BrowserRouter>
         {/* {isLoading && <TeezinesLoader />} */}
        <ScrollToTop />
          <AllRoutes />
           <Toaster
        position="bottom-right"   // 👈 this sets the toast position
        reverseOrder={false}
        toastOptions={{
          duration: 5000, // auto close after 3 sec
          style: {
            background: "#fff",
            color: "#000",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "15px",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#fff",
            },
          },
        }}
      />
        </BrowserRouter>
      {/* </CategoryProvider> */}
    </div>
  )
}

export default App

