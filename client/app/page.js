"use client";

import apiClient from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    // Fetch user data
    const getMemberData = async (memberId) => {
        try {
            setIsLoadingUser(true);

            const { data } = await apiClient.get(
                `/organization/members/${memberId}`
            );

            if (data.data.member) {
                setUser(data.data.member);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingUser(false);
        }
    };

    useEffect(() => {
        const memberId = localStorage.getItem("stytch_member_id");

        getMemberData(memberId);
    }, []);

    const handleDeactivateAccount = async () => {
        try {
            const { data } = await apiClient.delete(
                `/organization/members/${user.member_id}/deactivate`
            );

            if (data.data.member_id) {
                alert("You have successfully deactivated your account");
                router.replace("/login");
            }

            if (data.data.message) {
                alert(data.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="bg-white w-96 shadow-lg p-8 rounded">
                {isLoadingUser ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <h4 className="font-semibold text-xl">
                            Hello, {user?.name}
                        </h4>
                        <p className="text-gray-500 text-sm font-semibold">
                            Welcome to your dashboard
                        </p>

                        <div className="mt-4">
                            <p>
                                <span className="font-semibold">
                                    Email Address:
                                </span>{" "}
                                {user?.email_address}{" "}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Email Address Verified:
                                </span>{" "}
                                {user?.email_address_verified
                                    ? "True"
                                    : "False"}{" "}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    MFA Enrolled:
                                </span>{" "}
                                {user?.mfa_enrolled ? "True" : "False"}{" "}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    MFA Phone Number:
                                </span>{" "}
                                {user?.mfa_phone_number
                                    ? user?.mfa_phone_number
                                    : "Not set"}{" "}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    MFA Phone Number Verified:{" "}
                                </span>{" "}
                                {user?.mfa_phone_number_verified
                                    ? "True"
                                    : "False"}
                            </p>
                        </div>

                        <button
                            onClick={handleDeactivateAccount}
                            className="mt-6 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Deactivate Account
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}