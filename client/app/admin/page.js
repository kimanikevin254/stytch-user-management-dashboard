"use client";

import DashboardLayout from "@/components/DashboardLayout";
import InviteUserModal from "@/components/InviteUserModal";
import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/utils/apiClient";

export default function Home() {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [members, setMembers] = useState([]);

    // Loading status
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    const handleModal = () => {
        setIsOpen(!modalIsOpen);
    };

    const fetchMembers = async () => {
        try {
            setIsLoadingMembers(true);

            const { data } = await apiClient.get("/organization/members");

            setMembers(data.data.members);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold">Users</h1>
                    <p className="text-gray-500 text-sm font-semibold">
                        Manage your users
                    </p>
                </div>

                <button
                    onClick={handleModal}
                    className="bg-black text-white px-4 py-2 rounded cursor-pointer"
                >
                    + Add User
                </button>
            </div>

            {/* List of users */}
            <div className="mt-12 relative overflow-x-auto shadow-md">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Member ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email Address
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                MFA Enrolled
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingMembers ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-6 py-4 text-center"
                                >
                                    Loading users...
                                </td>
                            </tr>
                        ) : members?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-6 py-4 text-center"
                                >
                                    No users available. Please invite users.
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr
                                    key={member.member_id}
                                    className="bg-white border-b hover:bg-gray-50"
                                >
                                    <th
                                        scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        <Link
                                            href={`/admin/users/${member.member_id}`}
                                            className="underline"
                                        >
                                            {member.member_id}
                                        </Link>
                                    </th>
                                    <td className="px-6 py-4">{member.name}</td>
                                    <td className="px-6 py-4">
                                        {member.email_address}
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.status}
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.mfa_enrolled ? "True" : "False"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <InviteUserModal
                modalIsOpen={modalIsOpen}
                handleModal={handleModal}
                fetchMembers={fetchMembers}
            />
        </DashboardLayout>
    );
}