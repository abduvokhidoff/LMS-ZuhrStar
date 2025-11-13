import React from 'react'
import Aside from '../components/Aside'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
		<div className='flex relative bg-[#f1f9ff]'>
			<Aside className='absolute top-0 left-0' />
			<Outlet className='w-[100%]' />
		</div>
	)
}

export default MainLayout