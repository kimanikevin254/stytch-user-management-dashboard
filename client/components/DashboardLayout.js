"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    return (
        <div className="bg-gray-100 h-screen w-screen overflow-hidden flex">
            {/* Sidebar */}
            <div className="w-52 p-4 flex flex-col">
                <h1 className="font-bold text-xl text-center">
                    ADMIN DASHBOARD
                </h1>

                <hr className="border-b my-4" />

                <div className="flex flex-1 flex-col space-y-4 ml-12">
                    <Link
                        href="/admin"
                        className={
                            pathname === "/admin"
                                ? "font-semibold text-blue-500"
                                : "font-semibold"
                        }
                    >
                        Users
                    </Link>
                    <Link
                        href="/admin/organization"
                        className={
                            pathname === "/admin/organization"
                                ? "font-semibold text-blue-500"
                                : "font-semibold"
                        }
                    >
                        Organization
                    </Link>
                </div>

                <button className="mb-12 ml-12 bg-gray-300 w-fit px-6 py-2 rounded cursor-pointer font-semibold">
                    Log out
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 bg-white m-6 p-6 rounded-lg overflow-y-scroll">
                {children}
            </div>
        </div>
    );
}