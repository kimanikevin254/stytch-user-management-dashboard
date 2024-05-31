"use client";

import DashboardLayout from "@/components/DashboardLayout";
import apiClient from "@/utils/apiClient";
import { useEffect, useState } from "react";

export default function Page() {
    const [organization, setOrganization] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableOrgDetails, setEditableOrgDetails] = useState({
        organization_name: "",
        email_allowed_domains: [],
        mfa_policy: "OPTIONAL",
    });

    const fetchOrgDetails = async () => {
        try {
            setIsLoading(true);
            const { data } = await apiClient.get("/organization");
            if (data.data) {
                setOrganization(data.data);
                setEditableOrgDetails({
                    organization_name: data.data.organization_name,
                    email_allowed_domains: data.data.email_allowed_domains,
                    mfa_policy: data.data.mfa_policy,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableOrgDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleEmailDomainsChange = (index, value) => {
        const newEmailDomains = [...editableOrgDetails.email_allowed_domains];
        newEmailDomains[index] = value;
        setEditableOrgDetails((prevDetails) => ({
            ...prevDetails,
            email_allowed_domains: newEmailDomains,
        }));
    };

    const addEmailDomain = () => {
        setEditableOrgDetails((prevDetails) => ({
            ...prevDetails,
            email_allowed_domains: [...prevDetails.email_allowed_domains, ""],
        }));
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Submit the updated organization details to the API
            const { data } = await apiClient.put("/organization", {
                newData: editableOrgDetails,
            });
            setOrganization(data.data);
            setIsEditing(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchOrgDetails();
    }, []);

    return (
        <DashboardLayout>
            <h3 className="font-bold text-xl mb-4">Organization Details</h3>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {isEditing ? (
                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            <div>
                                <label className="font-semibold">Name:</label>
                                <input
                                    type="text"
                                    name="organization_name"
                                    value={editableOrgDetails.organization_name}
                                    onChange={handleInputChange}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <div className="mb-2">
                                    <label className="font-semibold">
                                        Allowed Email Domains:
                                    </label>
                                    <button
                                        onClick={addEmailDomain}
                                        className="ml-4 px-3 py-1 bg-gray-400 rounded text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                {editableOrgDetails.email_allowed_domains.map(
                                    (domain, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={domain}
                                            onChange={(e) =>
                                                handleEmailDomainsChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            className="border p-2 rounded w-full mb-2"
                                        />
                                    )
                                )}
                            </div>
                            <div>
                                <label className="font-semibold">
                                    MFA Policy:
                                </label>
                                <select
                                    name="mfa_policy"
                                    value={editableOrgDetails.mfa_policy}
                                    onChange={handleInputChange}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="OPTIONAL">OPTIONAL</option>
                                    <option value="REQUIRED_FOR_ALL">
                                        REQUIRED_FOR_ALL
                                    </option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-black text-white px-8 py-2 rounded mt-4"
                            >
                                Save
                            </button>
                        </form>
                    ) : (
                        <div>
                            <p>
                                <span className="font-semibold">Name:</span>{" "}
                                {organization?.organization_name}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Allowed Email Domains:
                                </span>{" "}
                                {organization?.email_allowed_domains?.join(
                                    ", "
                                )}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    MFA Policy:
                                </span>{" "}
                                {organization?.mfa_policy}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    MFA Methods:
                                </span>{" "}
                                {organization?.mfa_methods}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Email Invites:
                                </span>{" "}
                                {organization?.email_invites}
                            </p>
                        </div>
                    )}
                    <button
                        onClick={toggleEditMode}
                        className="bg-gray-300 px-8 py-2 rounded mt-4"
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}