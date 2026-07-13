import React from 'react';
import { Link } from 'react-router-dom';
import BinaryPupil from './BinaryPupilLogo';

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-4">
            <BinaryPupil status="idle" className="w-12 h-12" />
            <span className="text-xl font-bold tracking-wider text-white neon-text-green mt-1">
              DEEP<span className="text-neon-blue neon-text-blue">THINK</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
