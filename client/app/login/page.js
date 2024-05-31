"use client";

import apiClient from "@/utils/apiClient";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");

    const handleLogin = async (e) => {
        try {
            e.preventDefault();

            const { data } = await apiClient.post("/auth/login", { email });

            if (data.data.magic_link_sent) {
                alert(
                    "Log in using the link sent to the provided email address"
                );
            } else if (data.data.message) {
                alert(data.data.message);
            } else {
                alert("An error occured");
            }
        } catch (error) {
            console.log(error);
            alert("An error occured");
        }
    };
    return (
        <form
            onSubmit={handleLogin}
            className="h-screen w-screen flex items-center justify-center overflow-hidden"
        >
            <div className="w-96 flex flex-col p-4 shadow-lg rounded">
                <h2 className="text-2xl font-semibold text-center">
                    Login or Sign Up
                </h2>
                <p className="text-xs text-gray-500 font-semibold text-center">
                    Provide your email address to continue
                </p>

                <div className="mt-6 flex flex-col justify-start items-start">
                    <label>Email Adress</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className="border border-gray-200 w-full px-2 py-1 rounded focus:outline-none"
                    />
                </div>

                <div className="mt-6 flex items-center justify-center">
                    <button className="bg-black text-white px-6 py-2 rounded cursor-pointer">
                        Send Magic Link
                    </button>
                </div>
            </div>
        </form>
    );
}