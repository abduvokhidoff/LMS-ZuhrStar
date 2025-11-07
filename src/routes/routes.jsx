import { createHashRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginLayout from "../layouts/LoginLayout";





const routes = createHashRouter([
  {
    path: '/',
    element: <ProtectedRoute/>,
    children: [
      {
        path: '/',
        element: <MainLayout/>
      }
    ]
  },
  {
    path: '/login',
    element: <LoginLayout/>
  }
])

export default routes