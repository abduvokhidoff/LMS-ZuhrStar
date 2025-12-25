import { EyeClosed, EyeIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../redux/authSlice'
import { useNavigate } from 'react-router-dom'

const LoginLayout = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const [studentData, setStudentData] = useState({
		student_phone: '',
		password: '',
	})

	// 👁 Toggle password visibility
	const togglePassword = () => {
		setShowPassword(prev => !prev)
	}

	// 🚀 Handle login
	const handleSubmit = async e => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const response = await fetch(
				'https://zuhrstar-production.up.railway.app/api/auth/student/login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify(studentData),
				}
			)

			const data = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Login failed')
			}

			// ✅ IMPORTANT: match authSlice payload
			dispatch(
				login({
					user: data.user,
					accessToken: data.accessToken,
					refreshToken: data.refreshToken,
				})
			)

			navigate('/')
		} catch (err) {
			console.error('❌ Login failed:', err)
			setError('Invalid phone or password')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex items-center justify-center h-screen bg-[linear-gradient(to_right,_#1e5fd9,_#348cff,_#348fff,_#348cff,_#1e5fd9)]'>
			<div className='w-[50%] h-full flex flex-col justify-center gap-[60px] px-[60px] bg-[#ffffff20] backdrop-blur-lg rounded-[20px]'>
				{/* Title */}
				<h1 className='text-white text-[62px] font-bold'>Student</h1>

				{/* Form */}
				<form onSubmit={handleSubmit} className='flex flex-col gap-[30px]'>
					{/* Phone */}
					<input
						type='text'
						placeholder='Your Phone Number'
						required
						value={studentData.student_phone}
						onChange={e =>
							setStudentData({
								...studentData,
								student_phone: e.target.value,
							})
						}
						className='px-[20px] py-[12px] rounded-[12px] outline-none border border-[#d8e0f2]'
					/>

					{/* Password */}
					<div className='flex items-center px-[20px] py-[12px] bg-white rounded-[12px] border border-[#d8e0f2]'>
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder='Your Password'
							required
							value={studentData.password}
							onChange={e =>
								setStudentData({
									...studentData,
									password: e.target.value,
								})
							}
							className='w-full outline-none'
						/>

						<button type='button' onClick={togglePassword}>
							{showPassword ? (
								<EyeClosed className='text-[#aab0c0]' />
							) : (
								<EyeIcon className='text-[#aab0c0]' />
							)}
						</button>
					</div>

					{/* Submit */}
					<button
						type='submit'
						disabled={loading}
						className={`${
							loading ? 'bg-gray-400' : 'bg-[#123c91]'
						} text-white py-[12px] rounded-[12px] font-semibold text-[18px]`}
					>
						{loading ? 'Logging in...' : 'Log In'}
					</button>

					{/* Error */}
					{error && <p className='text-red-500 text-sm'>{error}</p>}
				</form>
			</div>
		</div>
	)
}

export default LoginLayout
