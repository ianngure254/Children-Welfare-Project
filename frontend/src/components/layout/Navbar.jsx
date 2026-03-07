import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo1.jpeg';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { currentUser, role, logout, loading } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: "Home", path: "Home" },
        { label: "About Us", path: "AboutUS" },
        { label: "Project", path: "Project" },
        { label: "Events", path: "Events" },
        { label: "Shop", path: "Shop" },
        { label: "Volunteer", path: "Volunteer" },
        { label: "Contacts", path: "Contacts" }
    ];

    const displayName = currentUser?.displayName || currentUser?.email || 'Account';
    const initials = displayName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        // FIXED: Added a base background (bg-orange-500) so it's visible even before scrolling
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 md:px-8 py-3 flex items-center justify-between 
            ${scrolled ? 'bg-orange-600 shadow-xl py-2' : 'bg-orange-500 text-white'}`}>
            
            {/* 1. LOGO */}
            <div className="shrink-0 cursor-pointer hover:scale-105 transition-transform">
                <img src={logo} alt="Logo" className='h-12 md:h-16 w-auto rounded-lg shadow-sm' />
            </div>
            
            {/* 2. DESKTOP LINKS (Middle) */}
            <ul className="hidden xl:flex items-center space-x-2">
                {navLinks.map((item) => (
                    <li key={item.path}>
                        <ScrollLink
                            to={item.path}
                            spy={true}
                            smooth={true}
                            offset={-70}
                            duration={500}
                            activeClass="text-yellow-300 border-b-2 border-yellow-300"
                            className="cursor-pointer px-3 py-2 text-sm font-semibold hover:text-yellow-200 transition-all"
                        >
                            {item.label}
                        </ScrollLink>
                    </li>
                ))}
            </ul>

            {/* 3. CTA BUTTON & HAMBURGER (Right) */}
            <div className="flex items-center gap-4">
                {/* Authenticated User (Desktop) */}
                {!loading && currentUser && (
                    <div className="hidden md:flex items-center gap-3">
                        {currentUser.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt={displayName}
                                className="h-9 w-9 rounded-full border-2 border-white/70 object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-white/90 text-orange-700 font-bold text-sm flex items-center justify-center">
                                {initials}
                            </div>
                        )}
                        <span className="text-sm font-semibold text-white/90 max-w-35 truncate">
                            {displayName}
                        </span>
                        {isAdmin && (
                            <RouterLink
                                to="/admin"
                                className="bg-white/90 text-orange-700 px-4 py-2 rounded-full font-bold text-xs shadow-md hover:bg-white transition-all"
                            >
                                ADMIN
                            </RouterLink>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-white text-orange-600 px-4 py-2 rounded-full font-bold text-xs shadow-md hover:bg-yellow-50 hover:shadow-lg transition-all active:scale-95"
                        >
                            LOGOUT
                        </button>
                    </div>
                )}

                {/* Professional CTA Button */}
                <ScrollLink
                    to="Contacts"
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    className="hidden md:block bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-yellow-50 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                    DONATE NOW
                </ScrollLink>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="xl:hidden p-2 rounded-md hover:bg-black/10 transition-colors"
                >
                    {isOpen ? <HiX className="text-3xl" /> : <HiMenu className="text-3xl" />}
                </button>
            </div>

            {/* 4. MOBILE DRAWER */}
            <div className={`absolute top-full left-0 w-full bg-orange-700 transition-all duration-300 ease-in-out overflow-hidden xl:hidden
                ${isOpen ? 'max-h-screen opacity-100 shadow-2xl' : 'max-h-0 opacity-0'}`}>
                <ul className="flex flex-col items-center space-y-2 py-6">
                    {/* Authenticated User (Mobile) */}
                    {!loading && currentUser && (
                        <li className="w-full flex flex-col items-center gap-3 pb-4">
                            {currentUser.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt={displayName}
                                    className="h-12 w-12 rounded-full border-2 border-white/80 object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-white/90 text-orange-700 font-bold text-base flex items-center justify-center">
                                    {initials}
                                </div>
                            )}
                            <span className="text-white/90 text-sm font-semibold max-w-35 truncate">
                                {displayName}
                            </span>
                            {isAdmin && (
                                <RouterLink
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-white/90 text-orange-700 px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-white transition-all"
                                >
                                    ADMIN
                                </RouterLink>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-yellow-50 hover:shadow-lg transition-all active:scale-95"
                            >
                                LOGOUT
                            </button>
                        </li>
                    )}
                    {navLinks.map((item) => (
                        <li key={item.label} className="w-full text-center">
                            <ScrollLink
                                to={item.path}
                                smooth={true}
                                offset={-70}
                                onClick={() => setIsOpen(false)}
                                className="block w-full py-3 text-lg font-medium hover:bg-orange-800 transition-colors"
                            >
                                {item.label}
                            </ScrollLink>
                        </li>
                    ))}
                    {/* CTA in Mobile Menu */}
                    <li className="pt-4 w-full px-10">
                        <ScrollLink
                            to="Volunteer"
                            smooth={true}
                            offset={-70}
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-white text-orange-600 py-3 rounded-full font-bold shadow-lg block text-center cursor-pointer"
                        >
                            VOLUNTEER
                        </ScrollLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
