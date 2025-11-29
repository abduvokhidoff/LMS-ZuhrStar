import { createHashRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginLayout from "../layouts/LoginLayout";
import Home from "../pages/Home";
import Lessons from "../pages/Lessons";
import Marks from "../pages/Marks";
import Ranking from "../pages/Ranking";
import ExtraLessons from "../pages/ExtraLessons";





const routes = createHashRouter([
	{
		path: '/',
		element: <ProtectedRoute />,
		children: [
			{
				path: '/',
				element: <MainLayout />,
				children: [
					{
						path: '/',
						element: <Home />,
					},
					{
						path: '/lessons',
						element: <Lessons />,
					},
					{
						path: '/marks',
						element: <Marks />,
					},
					{
						path: '/ranking',
						element: <Ranking />,
					},
					{
						path: '/extra-lessons',
						element: <ExtraLessons />,
					},
				],
			},
		],
	},
	{
		path: '/login',
		element: <LoginLayout />,
	},
])

export default routes