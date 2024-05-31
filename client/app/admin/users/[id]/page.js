"use client";

import DashboardLayout from "@/components/DashboardLayout";
import apiClient from "@/utils/apiClient";
import { useEffect, useState } from "react";

export default function Page({ params }) {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    const [userSettings, setUserSettings] = useState({
        mfaEnabled: false,
        stepUpAuthEnabled: false,
        hasAdminRole: false,
    });

    // Update userSettings when user state changes
    useEffect(() => {
        if (user) {
            setUserSettings({
                mfaEnabled: user.mfa_enrolled,
                stepUpAuthEnabled: user.step_up_auth_enabled,
                hasAdminRole: user.roles?.some(
                    (role) => role.role_id === "admin"
                ),
            });
        }
    }, [user]);

    const handleUserSettings = (e) => {
        const { name, checked } = e.target;

        setUserSettings((prevUserSettings) => ({
            ...prevUserSettings,
            [name]: checked,
        }));
    };

    // Fetch user data
    const getMemberData = async () => {
        try {
            setIsLoadingUser(true);

            const { data } = await apiClient.get(
                `/organization/members/${params.id}`
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
        getMemberData();
    }, [params.id]);

    // Update user settings
    const handleUserUpdate = async (e) => {
        try {
            e.preventDefault();

            const { data } = await apiClient.put(
                `/organization/members/${params.id}/update`,
                { userSettings }
            );

            if (data.data.member) {
                setUser(data.data.member);
                alert("User settings updated successfully");
            }
        } catch (error) {
            console.log(error);
            alert(error?.error?.message);
        }
    };

    // Deactivate a user
    const toggleUserActiveStatus = async () => {
        try {
            const { data } = await apiClient.put(
                `/organization/members/${params.id}/toggle-active-status`
            );

            if (data.data.member_id) {
                getMemberData();
                alert("User active status toggled successfully");
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <DashboardLayout>
            {isLoadingUser ? (
                <p>Loading user details</p>
            ) : (
                <div>
                    <h3 className="font-bold text-xl">Member Details</h3>
                    <div>
                        <p>
                            <span className="font-semibold">ID:</span>{" "}
                            {user?.member_id}
                        </p>
                        <p>
                            <span className="font-semibold">Name:</span>{" "}
                            {user?.name}
                        </p>
                        <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {user?.email_address}
                        </p>
                        <p>
                            <span className="font-semibold">Status:</span>{" "}
                            {user?.status}
                        </p>
                        <p>
                            <span className="font-semibold">MFA Enrolled:</span>{" "}
                            {user?.mfa_enrolled ? "True" : "False"}
                        </p>
                        {user?.status === "active" && (
                            <p>
                                <span className="font-semibold">Roles:</span>{" "}
                                {user?.roles
                                    ?.map((role) => role.role_id)
                                    .join(", ")}
                            </p>
                        )}
                        <p>
                            <span className="font-semibold">
                                Step-up Auth Enabled:
                            </span>{" "}
                            {user?.step_up_auth_enabled ? "True" : "False"}
                        </p>
                    </div>

                    <h3 className="font-bold text-xl mt-8">Actions</h3>
                    <form onSubmit={handleUserUpdate}>
                        {user?.status === "active" && (
                            <>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="mfaEnabled"
                                        checked={userSettings.mfaEnabled}
                                        onChange={handleUserSettings}
                                    />
                                    <label>Enable MFA</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="stepUpAuthEnabled"
                                        checked={userSettings.stepUpAuthEnabled}
                                        onChange={handleUserSettings}
                                    />
                                    <label>Enable Step-up Auth</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="hasAdminRole"
                                        checked={userSettings.hasAdminRole}
                                        onChange={handleUserSettings}
                                    />
                                    <label>Is Admin</label>
                                </div>
                            </>
                        )}

                        <div className="flex gap-6 items-center">
                            <button
                                type="button"
                                onClick={toggleUserActiveStatus}
                                className={`mt-4 ${
                                    user?.status === "inactive"
                                        ? "bg-blue-500"
                                        : "bg-red-500"
                                } text-white px-8 py-2 rounded`}
                            >
                                {user?.status === "active"
                                    ? "Deactivate"
                                    : "Activate"}{" "}
                                User
                            </button>
                            <button
                                type="submit"
                                className="mt-4 bg-black text-white px-8 py-2 rounded"
                            >
                                Update User
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}