import { RouterProvider } from "react-router-dom"
import routes from "./routes/routes"


function App() {
  console.log('🔥 APP.JSX ISHLAYAPTI')



  return (
   <>
    <RouterProvider router={routes}/>
   </>
  )
}

export default App
