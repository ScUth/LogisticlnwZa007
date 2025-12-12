"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import logo from "./img/whitelogo.png";
import { useAuth } from "@/context/authContext";
import Image from "next/image";

export function NavigationBar() {

	const router = useRouter();

	const { user, logout } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	const handleLogout = async () => {
		try {
      await logout();
      setMenuOpen(false);
      if (router.pathname !== '/login') router.push('/');
			console.log("User logged out successfully");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	const handleLogin = () => {
		router.push('/login');
	}

	useEffect(() => {
		function handleClickOutside(e) {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		}

		function handleEsc(e) {
			if (e.key === 'Escape') setMenuOpen(false);
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEsc);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEsc);
		};
	}, []);

	return (
		<nav className="bg-amber-600 sticky w-full z-20 top-0 start-0 border-b border-default">
			<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
				<a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
					<Image src={logo} alt="Logo" className="flex w-auto h-9" />
				</a>
				<button
					data-collapse-toggle="navbar-default"
					type="button"
					className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary"
					aria-controls="navbar-default"
					aria-expanded="false"
				>						<span className="sr-only">Open main menu</span>
						<svg
							className="w-6 h-6"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="2"
							d="M5 7h14M5 12h14M5 17h14"
						/>
					</svg>
				</button>
				<div className="hidden w-full md:block md:w-auto" id="navbar-default">
					<ul className="font-medium flex flex-col text-gray-50 p-4 md:p-0 mt-4 border border-default rounded-base bg-neutral-secondary-soft md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-neutral-primary">
						<li>
							<a
								href="/"
								className="block py-2 px-3 bg-brand rounded md:bg-transparent md:text-fg-brand md:p-0"
								aria-current="page"
							>
								Home
							</a>
						</li>
						<li>
							<a
								href="/aboutus"
								className="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
							>
								About
							</a>
						</li>
						<li>
							<a
								href="#"
								className="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
							>
								Services
							</a>
						</li>
						<li>
							<a
								href="#"
								className="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
							>
								Pricing
							</a>
						</li>
						<li>
							<a
								href="/contact"
								className="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
							>
								Contact
							</a>
						</li>
						<li>
							{!user &&
								<button className="border rounded-sm pl-2 pr-2 hover:bg-white hover:text-amber-600" onClick={handleLogin}>
									Login
								</button>
								}
							{user && (
								<div className="relative" ref={menuRef}>
									<button aria-expanded={menuOpen} onClick={() => setMenuOpen((s) => !s)} className="border rounded-sm pl-2 pr-2 flex items-center space-x-2 hover:bg-white hover:text-amber-600">
										<span>{user.first_name} {user.last_name}</span>
										<svg className="w-4 h-4 text-gray-50 hover:text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>
									{menuOpen && (
										<div className="absolute right-0 mt-2 w-40 bg-amber-600 text-white hover:bg-amber-800 hover:text-white rounded shadow-lg z-50 border-2">
											<button onClick={handleLogout} className="w-full text-left py-2 px-3 hover:bg-neutral-tertiary">Logout</button>
										</div>
									)}
								</div>
							)}
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}
