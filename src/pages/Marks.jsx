import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateTokens, logout } from '../redux/authSlice'
import sterelka from '../assets/sterelka.png'
import { NavLink } from 'react-router-dom'

const Marks = () => {
  const [studentGroups, setStudentGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const dispatch = useDispatch()
  const { accessToken, refreshToken } = useSelector(state => state.auth)

  const refreshAccessToken = async () => {
    try {
      const possibleEndpoints = [
        'https://zuhr-star-production.up.railway.app/api/auth/refresh',
        'https://zuhr-star-production.up.railway.app/api/refresh',
        'https://zuhr-star-production.up.railway.app/auth/refresh'
      ]

      let lastError = null
      
      for (const endpoint of possibleEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })

          if (response.ok) {
            const data = await response.json()
            dispatch(updateTokens({ 
              accessToken: data.accessToken || data.access_token, 
              refreshToken: data.refreshToken || data.refresh_token || refreshToken 
            }))
            return data.accessToken || data.access_token
          }
          
          lastError = new Error(`Token yangilash muvaffaqiyatsiz: ${response.status}`)
        } catch (err) {
          lastError = err
          continue
        }
      }

      throw lastError || new Error('Token yangilash muvaffaqiyatsiz')
    } catch (err) {
      console.error('Refresh token error:', err)
      dispatch(logout())
      throw err
    }
  }

  const fetchWithAuth = async (url, retryCount = 0) => {
    try {
      let token = accessToken

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401 && retryCount < 1) {
        console.log('Access token eskirgan, yangilanmoqda...')
        try {
          const newAccessToken = await refreshAccessToken()
          
          return fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json',
            },
          })
        } catch (refreshErr) {
          console.error('Token yangilash xatosi:', refreshErr)
          throw new Error('Autentifikatsiya xatosi. Iltimos, qayta login qiling.')
        }
      }

      if (!response.ok) {
        throw new Error(`API xatosi: ${response.status}`)
      }

      return response
    } catch (err) {
      throw err
    }
  }

  const formatDays = (daysObj) => {
    if (!daysObj || typeof daysObj !== 'object') {
      return 'Kunlar ko\'rsatilmagan'
    }
    
    const { odd_days, even_days, every_days } = daysObj
    
    if (every_days && every_days.length > 0) {
      return every_days.join(', ')
    }
    
    const allDays = []
    if (odd_days && odd_days.length > 0) {
      allDays.push(`Toq: ${odd_days.join(', ')}`)
    }
    if (even_days && even_days.length > 0) {
      allDays.push(`Juft: ${even_days.join(', ')}`)
    }
    
    return allDays.length > 0 ? allDays.join(' | ') : 'Kunlar ko\'rsatilmagan'
  }

  useEffect(() => {
    const fetchStudentGroups = async () => {
      try {
        setLoading(true)
        console.log('🔄 Student va guruhlar yuklanmoqda...')
        
        const studentsResponse = await fetchWithAuth('https://zuhr-star-production.up.railway.app/api/students')
        const studentsData = await studentsResponse.json()
        
        console.log('👥 Students API response:', studentsData)
        
        let currentStudent = null
        
        if (studentsData && (studentsData._id || studentsData.id)) {
          currentStudent = studentsData
        } 
        else if (Array.isArray(studentsData) && studentsData.length > 0) {
          currentStudent = studentsData[0] 
        }
        else if (studentsData?.data) {
          if (Array.isArray(studentsData.data) && studentsData.data.length > 0) {
            currentStudent = studentsData.data[0]
          } else if (studentsData.data._id || studentsData.data.id) {
            currentStudent = studentsData.data
          }
        }
        
        console.log('👤 Joriy student:', currentStudent)
        
        if (!currentStudent) {
          setError('Student ma\'lumotlari topilmadi')
          setLoading(false)
          return
        }
        
        const currentStudentId = currentStudent._id || currentStudent.id
        
        if (!currentStudentId) {
          setError('Student ID topilmadi')
          setLoading(false)
          return
        }
        
        console.log('🆔 Student ID:', currentStudentId)
        
        const groupsResponse = await fetchWithAuth('https://zuhr-star-production.up.railway.app/api/groups')
        const groupsData = await groupsResponse.json()
        
        console.log('📚 Groups API response:', groupsData)
        
        const studentGroupsList = []
        
        const allGroups = Array.isArray(groupsData) ? groupsData : (groupsData?.data || [])
        
        allGroups.forEach(group => {
          const groupStudents = group.students || []
          
          const isStudentInGroup = groupStudents.some(student => {
            if (typeof student === 'string') {
              return student === currentStudentId
            }
            return (student._id === currentStudentId || student.id === currentStudentId)
          })
          
          if (isStudentInGroup) {
            console.log(`✅ Student guruhda topildi: ${group.name || group.groupName}`)
            studentGroupsList.push({
              ...group,
              studentId: currentStudentId
            })
          }
        })
        
        console.log('📋 Student guruhlari:', studentGroupsList)
        
        if (studentGroupsList.length === 0) {
          console.warn('⚠️ Student hech qanday guruhga a\'zo emas')
        }
        
        setStudentGroups(studentGroupsList)
        setLoading(false)
        
      } catch (err) {
        console.error('❌ Ma\'lumotlar yuklanmadi:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (accessToken) {
      fetchStudentGroups()
    } else {
      setError('Token topilmadi, iltimos qayta login qiling')
      setLoading(false)
    }
  }, [accessToken])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <p className='text-xl mb-2'>Loading...</p>
          <p className='text-sm text-gray-500'>Ma\'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <p className='text-xl text-red-500 mb-2'>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='px-4 py-2 bg-blue-500 text-white rounded-lg'
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='flex pt-[36px] pl-[38px]'>
        <h1 className='w-[86px] h-[34px] text-2xl font-bold'>Marks</h1>
      </div>

      <div className='flex pt-[10px] pl-[39px]'>
        <p className='w-[157px] h-[21px] text-[#545454]'>Check your marks!</p>
      </div>

      <div className='flex flex-wrap gap-[26px] pt-[20px] pl-[38px]'>
        {studentGroups.length > 0 ? (
          studentGroups.map((group) => (
            <div key={group.id || group._id} className='w-[342px] h-[270px] rounded-[18px] bg-[#FFFFFF]'>
              <div className='flex pt-[108px] pl-[26px]'>
                <h1 className='w-[290px] h-[39px] text-2xl font-bold'>
                  {group.name || group.groupName || 'Nomsiz guruh'}
                </h1>
              </div>
              
              <div className='flex pt-[10px] pl-[26px]'>
                <p className='w-[290px] h-[24px] text-[#5A5A5A] text-sm'>
                  {group.time || group.schedule || '19:00-20:00'} | {formatDays(group.days)}
                </p>
              </div>

              <NavLink to={`/marks-attandance?groupId=${group.id|| group._id}`}>
                <div className='flex pt-[13px] pl-[27px]'>
                  <button className='w-[288px] h-[50px] rounded-[14px] bg-[#4F46E5] flex items-center justify-center text-white text-lg font-medium'>
                    <p className='pr-[10px]'>Start</p>
                    <img src={sterelka} alt="" />
                  </button>
                </div>
              </NavLink>
            </div>
          ))
        ) : (
          <div className='flex justify-center items-center w-full pt-10'>
            <p className='text-gray-500'>Siz hech qanday guruhga a'zo emassiz</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Marks