import {
	BookCheck,
	BookOpenCheck,
	DoorClosed,
	DoorOpen,
	Home,
	Medal,
	NotebookPen,
} from 'lucide-react'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../assets/logo.png'
import { logout } from '../redux/authSlice'
import { useDispatch } from 'react-redux'


const Aside = () => {
	const dispatch = useDispatch()
	const pages = [
		{ title: 'Home', path: '/', icon: Home },
		{ title: 'Lessons', path: '/lessons', icon: BookCheck },
		{ title: 'Marks', path: '/marks', icon: BookOpenCheck },
		{ title: 'Ranking', path: '/ranking', icon: Medal },
		{ title: 'ExtraLessons', path: '/extra-lessons', icon: NotebookPen },
	]

	const location = useLocation()

	return (
		<div className='w-[285px] px-[17px] h-[100vh] py-[50px] flex flex-col gap-[40px] bg-[white]'>
			<div>
				<img className='w-[150px]' src={Logo} alt='' />
			</div>
			<div className='flex flex-col justify-between h-[100%]'>
				<div className='flex flex-col gap-[10px]'>
					{pages.map(v => {
						const isActive = location.pathname === v.path
						const Icon = v.icon
						return (
							<NavLink
								key={v.title}
								to={v.path}
								className={`flex items-center gap-[13px] px-[13px] py-[10px] w-[100%] rounded-[8px] ${
									isActive ? 'bg-[#eaf3ff]' : 'bg-transparent'
								}`}
							>
								<Icon size={24} color={isActive ? '#348cff' : '#7c8594'} />
								<p
									className={`${
										isActive ? 'text-[#348cff]' : 'text-[#7c8594]'
									} font-[Nunito Sans] font-[600] text-[16px]`}
								>
									{v.title}
								</p>
							</NavLink>
						)
					})}
				</div>
				<div>
					<button
						onClick={() => dispatch(logout())}
						className='flex items-center gap-[13px] px-[13px] py-[10px] rounded-[8px] rounded-[8px] bg-[#ff00006c] w-[100%] text-[red] font-[Nunito Sans] font-[600] '
					>
						<DoorOpen size={20} />
						LogOut
					</button>
				</div>
			</div>
		</div>
	)
}

export default Aside
