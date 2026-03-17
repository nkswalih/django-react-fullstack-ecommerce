import React from 'react'
import { Link } from 'react-router-dom'

const AuthButton = () => {
  return (
   <div className="hidden lg:flex items-center space-x-4">
      <Link
            to="/sign_in"
            className="text-xs font-normal text-gray-700 hover:text-gray-900 transition-colors"
        >
        Sign in
        </Link>
            <span className="h-4 w-px bg-gray-200"></span>
        <Link
            to="/sign_up"
            className="text-xs font-normal text-gray-700 hover:text-gray-900 transition-colors mr-6"
        >
        Sign up
        </Link>
    </div>
  )
}

export default AuthButton