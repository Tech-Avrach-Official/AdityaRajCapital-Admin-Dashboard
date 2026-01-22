import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-black w-full py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">Logo</h1>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-green-400 hover:text-green-300 font-medium">Home</a>
          <a href="/about" className="text-white hover:text-green-300 font-medium">About Us</a>
          <a href="/projects" className="text-white hover:text-green-300 font-medium">Projects</a>
          
          {/* Services Dropdown */}
       
          
          <a href="/contact" className="text-white hover:text-green-300 font-medium">Contact Us</a>
          <a href="/admin" className="text-white hover:text-green-300 font-medium">Admin</a>
        </div>
        
        {/* CTA Button and Social Icons */}
        <div className="flex items-center space-x-4">
          <button className="bg-green-400 hover:bg-green-500 text-black font-bold px-6 py-2 rounded-full">
            Pay Now
          </button>
          
          {/* Social Media Icons */}
          
          
          {/* Menu Icon (for mobile) */}
          <button className="block md:hidden text-white">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;