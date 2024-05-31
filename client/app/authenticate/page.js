"use client";

import apiClient from "@/utils/apiClient";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function page() {
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            apiClient
                .post("/auth/authenticate", { token })
                .then(({ data }) => {
                    localStorage.setItem("stytch_session_jwt", data.data.token);
                    localStorage.setItem(
                        "stytch_member_id",
                        data.data.memberId
                    );
                    if (data.data.roles.includes("admin")) {
                        window.location.href = "/admin";
                    } else {
                        window.location.href = "/";
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [token]);

    return null;
}