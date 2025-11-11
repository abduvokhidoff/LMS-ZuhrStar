import { Eye } from 'lucide-react'
import React, { useState } from 'react'

const LoginLayout = () => {
  const [inputType, setInputType] = useState('password')
  const [eyeType, setEyeType] = useState('Eye')

  const handleSubmit = () => {
    console.log('Everything is ok')
  }
  return (
    <div>
      <div>
        <form onSubmit={() => handleSubmit()}>
          <input type="text" placeholder='Your Phone Number' />
          <div>
            <input type={inputType} placeholder='Your Password' />
            <button>
              <img src={eyeType} alt="" />
            </button>
          </div>
        </form>
        <button>
          
        </button>
      </div>
      <div>
        <img src="" alt="" />
      </div>
    </div>
  )
}

export default LoginLayout