const { Router } = require("express");
const { stytchClient } = require("../utils/stytchClient");
const prisma = require("../utils/prismaClient");

const router = Router();

// Allow users to sign in or sign up
router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email address is registered in DB
        const userExists = await prisma.user.findUnique({
            where: { email_address: email },
        });

        // If user exists and their status is inactive, return a message
        if (userExists && userExists.status === "inactive") {
            return res.status(200).json({
                error: null,
                data: {
                    message:
                        "Looks like you have a deactivated account. Contact your admin to activate your account.",
                },
            });
        }

        await stytchClient.magicLinks.email.loginOrSignup({
            email_address: email,
            organization_id: process.env.STYTCH_ORG_ID,
            login_redirect_url: "http://localhost:3000/authenticate",
        });

        res.status(200).json({
            error: null,
            data: {
                magic_link_sent: true,
            },
        });
    } catch (error) {
        res.status(500).json({
            error: {
                type: error.error_type,
                message: error.error_message,
            },
            data: null,
        });
    }
});

// Authenticate the magic link
router.post("/authenticate", async (req, res) => {
    try {
        const { token } = req.body;

        const { session_jwt, member } =
            await stytchClient.magicLinks.authenticate({
                magic_links_token: token,
            });

        // Check if user exists in local database
        const userExists = await prisma.user.findUnique({
            where: { member_id: member.member_id },
        });

        if (!userExists) {
            await prisma.user.create({
                data: {
                    member_id: member.member_id,
                    name: member.name,
                    email_address: member.email_address,
                    mfa_enrolled: member.mfa_enrolled,
                    status: member.status,
                },
            });
        }

        res.status(200).json({
            error: null,
            data: {
                token: session_jwt,
                memberId: member.member_id,
                roles: member?.roles?.map((role) => role.role_id),
            },
        });
    } catch (error) {
        res.status(500).json({
            error: {
                type: error.error_type,
                message: error.error_message,
            },
            data: null,
        });
    }
});

module.exports = router;
