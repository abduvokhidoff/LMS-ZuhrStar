import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { updateTokens, logout } from '../redux/authSlice'
import chap from '../assets/chap.png'
import ong from '../assets/ong.png'

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const Marks_Attandance = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [students, setStudents] = useState([])
  const [marksData, setMarksData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const dispatch = useDispatch()
  const { accessToken, refreshToken } = useSelector(state => state.auth)
  const location = useLocation()

  const visibleMonths = months.slice(startIndex, startIndex + 3)

  const getGroupIdFromUrl = () => {
    const params = new URLSearchParams(location.search)
    return params.get('groupId')
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

  useEffect(() => {
    const fetchGroupAndStudents = async () => {
      try {
        setLoading(true)
        const groupId = getGroupIdFromUrl()
        
        if (!groupId) {
          setError('Guruh ID topilmadi')
          setLoading(false)
          return
        }

        console.log('🔄 Guruh ma\'lumotlari yuklanmoqda...')
        console.log('📌 Group ID:', groupId)
        
        const groupsResponse = await fetchWithAuth('https://zuhr-star-production.up.railway.app/api/groups')
        const groupsData = await groupsResponse.json()
        
        console.log('📚 Groups data:', groupsData)
        
        let currentGroup = null
        if (Array.isArray(groupsData)) {
          currentGroup = groupsData.find(g => (g.id || g._id) === groupId)
        }
        
        if (!currentGroup) {
          setError('Guruh topilmadi')
          setLoading(false)
          return
        }
        
        console.log('✅ Tanlangan guruh:', currentGroup)
        setSelectedGroup(currentGroup)
        
        const groupStudents = currentGroup.students || []
        console.log('👥 Guruh studentlari:', groupStudents)
        
        setStudents(groupStudents)
        
        const marksResponse = await fetchWithAuth('https://zuhr-star-production.up.railway.app/api/student-lms/marks-attendance')
        const marksDataResponse = await marksResponse.json()
        
        console.log('📊 Marks data:', marksDataResponse)
        
        const marks = Array.isArray(marksDataResponse) 
          ? marksDataResponse 
          : (marksDataResponse?.data || [])
        
        setMarksData(marks)
        setLoading(false)
      } catch (err) {
        console.error('❌ Ma\'lumotlar yuklanmadi:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (accessToken) {
      fetchGroupAndStudents()
    } else {
      setError('Token topilmadi, iltimos qayta login qiling')
      setLoading(false)
    }
  }, [accessToken, location.search])

  const nextMonth = () => {
    if (startIndex + 3 < months.length) {
      setStartIndex(prev => prev + 3)
    }
  }

  const prevMonth = () => {
    if (startIndex - 3 >= 0) {
      setStartIndex(prev => prev - 3)
    }
  }

  const getStudentMarks = (studentId) => {
    if (!Array.isArray(marksData)) {
      console.warn('marksData is not an array:', marksData)
      return { marks: [], overall: 'N/A' }
    }
    
    const studentMarks = marksData.find(m => 
      m.studentId === studentId || 
      m.student_id === studentId || 
      m.id === studentId ||
      m.student === studentId
    )
    return studentMarks || { marks: [], overall: 'N/A' }
  }

  const getOverallStyle = (overall) => {
    const overallLower = overall?.toLowerCase()
    if (overallLower === 'excellent' || overallLower === 'good') {
      return 'bg-[#DBE9FE80] text-[#3333B7]'
    } else if (overallLower === 'average') {
      return 'bg-[#FEF3C7] text-[#92400E]'
    } else if (overallLower === 'poor') {
      return 'bg-[#FEE2E2] text-[#991B1B]'
    }
    return 'bg-[#F3F4F6] text-[#545454]'
  }

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
    <div className='flex justify-center items-center pl-[39px]'>
      <div className='w-[1080px] min-h-[488px] rounded-[18px] bg-[#FFFFFF] pb-6'>

        <div className='flex justify-between px-[27px]'>
          <div>
            <div className='flex pt-[27px] pl-[27px]'>
              <h1 className='text-2xl font-bold'>
                {selectedGroup?.name || selectedGroup?.groupName || 'React f-1088'}
              </h1>
            </div>

            <div className='flex pt-[14px] pl-[27px]'>
              <p className='text-[#545454]'>
                {selectedGroup?.time || selectedGroup?.schedule || '19:00-20:00'} | {' '}
                {formatDays(selectedGroup?.days)}
              </p>
            </div>
          </div>

          <div className='flex pt-[28px]'>
            <div className='w-[426px] h-[62px] rounded-[14px] bg-[#F3F4F6] flex items-center px-[16px] gap-[12px]'>
              <img
                src={chap}
                alt="prev"
                className='cursor-pointer'
                onClick={prevMonth}
              />

              <div className='flex gap-[30px] flex-1 justify-center'>
                {visibleMonths.map((month) => {
                  const index = months.indexOf(month)

                  return (
                    <div
                      key={month}
                      onClick={() => setActiveIndex(index)}
                      className={`
                        px-[14px] py-[6px] rounded-[8px]
                        cursor-pointer text-sm whitespace-nowrap
                        ${
                          index === activeIndex
                            ? 'bg-white text-[#7FBAF9] font-semibold shadow'
                            : 'text-[#545454]'
                        }
                      `}
                    >
                      {month}
                    </div>
                  )
                })}
              </div>

              <img
                src={ong}
                alt="next"
                className='cursor-pointer'
                onClick={nextMonth}
              />
            </div>
          </div>
        </div>

        <div className='flex pl-[27px] pt-[38px]'>
          <div className='w-[1026px] h-[72px] bg-[#F9FAFB] flex justify-between px-[43px]'>
            <div className='flex pt-[26px]'>
              <h1 className='font-bold'>STUDENT</h1>
            </div>

            <div className='flex gap-[64px] justify-center items-center'>
              {[4,5,6,7,8].map(day => (
                <div key={day}>
                  <div className='pl-[9px]'><p>{day}</p></div>
                  <div>now</div>
                </div>
              ))}
              <div><p>OVERALL</p></div>
            </div>
          </div>
        </div>

        {students.length > 0 ? (
          students.map((student, i) => {
            const studentMarksData = getStudentMarks(student.id || student._id)
            const marks = studentMarksData.marks || []
            
            return (
              <React.Fragment key={student.id || student._id || i}>
                <div className='flex justify-between px-[75px] pt-[24px]'>
                  <p className='text-[#545454]'>
                    {student.name || student.fullName || student.firstName + ' ' + student.lastName || 'Unknown'}
                  </p>

                  <div className='flex gap-[83px]'>
                    {marks.slice(0, 5).map((mark, idx) => (
                      <p key={idx}>{mark !== null && mark !== undefined ? mark : '-'}</p>
                    ))}
                    
                    {marks.length < 5 && Array.from({ length: 5 - marks.length }).map((_, idx) => (
                      <p key={`empty-${idx}`}>-</p>
                    ))}

                    <div className={`min-w-[56px] h-[22px] rounded-[10px] flex justify-center items-center px-2 ${getOverallStyle(studentMarksData.overall)}`}>
                      <p className='text-xs'>{studentMarksData.overall || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {i < students.length - 1 && (
                  <div className='pl-[27px] pt-[23px]'>
                    <div className='w-[1026px] h-[1px] bg-[#ECEDF1]'></div>
                  </div>
                )}
              </React.Fragment>
            )
          })
        ) : (
          <div className='flex justify-center items-center pt-10'>
            <p className='text-gray-500'>Bu gruppada hech qanday o'quvchi topilmadi</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Marks_Attandance