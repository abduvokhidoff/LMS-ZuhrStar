import { Eye, EyeClosed, EyeIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../redux/authSlice'
import { useNavigate } from 'react-router-dom'

const LoginLayout = () => {
	const dispatch = useDispatch()
  const navigate = useNavigate()
	const [inputType, setInputType] = useState('password')
	const [eyeType, setEyeType] = useState(false)
	const [studentData, setStudentData] = useState({
		student_phone: '',
		password: '',
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	// toggle eye
	const eyeTypeSelect = e => {
		e.preventDefault()
		setEyeType(!eyeType)
		setInputType(eyeType ? 'password' : 'text')
	}

	// handle submit
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
					body: JSON.stringify({
						student_phone: studentData.student_phone,
						password: studentData.password,
					}),
				}
			)

			if (!response.ok) {
				const text = await response.text()
				throw new Error(text || 'Login failed')
			}

			const data = await response.json()

			// ✅ dispatch to Redux
			dispatch(
				login({
					user: data.user,
					accessToken: data.accessToken,
					refreshToken: data.refreshToken,
				})
			)

		} catch (err) {
			console.error('❌ Login failed:', err)
			setError('Invalid phone or password')
		} finally {
			setLoading(false)
      navigate('/')
		}
	}

	return (
		<div className='flex items-center justify-center py-[80px] h-[100vh] bg-[linear-gradient(to_right,_#1e5fd9,_#348cff,_#348fff,_#348cff,_#1e5fd9)]'>
			<img src='' alt='' />
			<div className='flex flex-col justify-center px-[60px] gap-[70px] h-[100%] w-[50%] rounded-[20px] bg-[#ffffff20]  backdrop-blur-lg '>
				<div>
					<h1 className='font-[Nunito Sans] font-[700] text-white text-[62px]'>
						Student
					</h1>
				</div>

				<form
					className='w-[100%] flex flex-col gap-[30px]'
					onSubmit={handleSubmit}
				>
					{/* Phone */}
					<input
						className='px-[20px] py-[10px] outline-none border bg-[white] border-[#d8e0f2] rounded-[12px]'
						type='text'
						value={studentData.student_phone}
						onChange={e =>
							setStudentData({ ...studentData, student_phone: e.target.value })
						}
						placeholder='Your Phone Number'
						required
					/>

					{/* Password */}
					<div className='px-[20px] py-[10px] bg-[white] border border-[#d8e0f2] rounded-[12px] flex items-center'>
						<input
							className='w-[100%] outline-none'
							type={inputType}
							value={studentData.password}
							onChange={e =>
								setStudentData({ ...studentData, password: e.target.value })
							}
							placeholder='Your Password'
							required
						/>
						<button onClick={eyeTypeSelect} type='button'>
							{eyeType ? (
								<EyeClosed className='text-[#aab0c0]' />
							) : (
								<EyeIcon className='text-[#aab0c0]' />
							)}
						</button>
					</div>

					{/* Login button */}
					<button
						type='submit'
						disabled={loading}
						className={`${
							loading ? 'bg-gray-400' : 'bg-[#123c91]'
						} py-[10px] rounded-[12px] font-[Nunito Sans] font-[600] text-white text-[18px]`}
					>
						{loading ? 'Logging in...' : 'Log In'}
					</button>

					{error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
				</form>
			</div>
		</div>
	)
}

export default LoginLayout
