import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  return (
    <nav className="fixed top-0 left-0 h-full w-20 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-6 z-50">
      {/* Top: Logo */}
      <div className="flex flex-col items-center gap-4">
        <span className="font-bold text-2xl tracking-tight text-white">T</span>
      </div>
      {/* Middle: Navigation Icons, Post Thread Button, and Profile */}
      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <Link to="/" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
          <span role="img" aria-label="Home" className="text-white">🏠</span>
        </Link>
        <Link to="/search" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
          <span role="img" aria-label="Search" className="text-white">🔍</span>
        </Link>
        {/* Post Thread Button as Link */}
        <Link to="/post" className="w-10 h-10 rounded-full bg-white border border-gray-400 flex items-center justify-center transition-colors duration-200 group hover:bg-black hover:border-gray-400" title="Post new thread">
          <span role="img" aria-label="New Thread" className="text-lg text-neutral-800 group-hover:text-gray-200 transition-colors duration-200">✚</span>
        </Link>
        <Link to="/notifications" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
          <span role="img" aria-label="Notifications" className="text-white">🔔</span>
        </Link>
        {/* Profile Icon below Notification */}
        <Link to="/profile" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
          <span role="img" aria-label="Profile" className="text-white">👤</span>
        </Link>
      </div>
      {/* Bottom: Login Icon */}
      {!isAuthRoute && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <Link to="/login" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <span role="img" aria-label="Login" className="text-white">🔑</span>
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar 