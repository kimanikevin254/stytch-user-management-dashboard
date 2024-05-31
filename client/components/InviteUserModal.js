"use client";

import apiClient from "@/utils/apiClient";
import { useState } from "react";
import Modal from "react-modal";

export default function InviteUserModal({
    modalIsOpen,
    handleModal,
    fetchMembers,
}) {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        hasAdminRole: false,
    });

    const handleUserData = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleUserInvitation = async (e) => {
        try {
            e.preventDefault();

            const { data } = await apiClient.post(
                "/organization/members/invite",
                { ...userData }
            );

            if (data.data.invite_sent) {
                alert("An invite has been sent to the provided email address");
                handleModal();
                fetchMembers();
            }
        } catch (error) {
            console.log(error.message);
        }
    };
    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={handleModal}
            style={{
                content: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    transform: "translate(-50%, -50%)",
                },
            }}
        >
            <form className="w-96" onSubmit={handleUserInvitation}>
                <h1 className="font-bold text-xl text-center">Invite User</h1>
                <div className="mt-4 flex flex-col">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={userData.name}
                        onChange={handleUserData}
                        className="border border-gray-200 px-2 py-1 rounded focus:outline-none"
                    />
                </div>

                <div className="mt-4 flex flex-col">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={userData.email}
                        onChange={handleUserData}
                        className="border border-gray-200 px-2 py-1 rounded focus:outline-none"
                    />
                </div>

                <div className="mt-4 flex space-x-2">
                    <input
                        type="checkbox"
                        name="hasAdminRole"
                        checked={userData.hasAdminRole}
                        onChange={handleUserData}
                    />
                    <label>Is admin</label>
                </div>

                <div className="mt-6 flex items-center justify-center">
                    <button
                        type="submit"
                        className="px-6 py-2 rounded bg-black text-white"
                    >
                        Send Invite Link
                    </button>
                </div>
            </form>
        </Modal>
    );
}