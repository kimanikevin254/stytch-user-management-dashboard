const { Router } = require('express');
const { stytchClient } = require('../utils/stytchClient');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const prisma = require('../utils/prismaClient');

const router = Router()

// Get Organization details
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { organization: { organization_name, email_allowed_domains, mfa_policy, mfa_methods, email_invites } } = await stytchClient.organizations.get({
            organization_id: process.env.STYTCH_ORG_ID
        })

        res.status(200).json({
            error: null,
            data: {
                organization_name,
                email_allowed_domains,
                mfa_policy,
                mfa_methods,
                email_invites
            }
        })
        
    } catch (err) {
        res.status(500).json({
            error: {
                type: error.error_type,
                message: error.error_message
            },
            data: null
        })
    }
})

// Update organization
router.put('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { newData } = req.body
        const { organization: { organization_name, email_allowed_domains, mfa_policy, mfa_methods, email_invites } } = await stytchClient.organizations.update(
            { ...newData, organization_id: process.env.STYTCH_ORG_ID },
            { authorization: { session_jwt: req.headers.authorization.split(' ')[1] }}
        )

        res.status(200).json({
            error: null,
            data: {
                organization_name,
                email_allowed_domains,
                mfa_policy,
                mfa_methods,
                email_invites
            }
        })

    } catch (error) {
        res.status(500).json({
            error: {
                type: error.error_type,
                message: error.error_message
            },
            data: null
        })
    }
})

// Get all members of the organization
router.get("/members", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const resp = await stytchClient.organizations.members.search(
            {
                organization_ids: [process.env.STYTCH_ORG_ID],
            },
            {
                authorization: {
                    session_jwt: req.headers.authorization.split(" ")[1],
                },
            }
        );

        const necessaryFields = [
            "member_id",
            "name",
            "email_address",
            "status",
            "mfa_enrolled",
        ];

        const stytchMembers = resp.members.map((member) => {
            const memberObj = {};

            necessaryFields.forEach((field) => {
                memberObj[field] = member[field];
            });

            return memberObj;
        });

        const localMembers = await prisma.user.findMany();

        // Merge arrays
        const mergedArray = [...stytchMembers, ...localMembers];

        // Remove duplicates based on member id
        const members = Array.from(
            new Set(mergedArray.map((member) => member.member_id))
        ).map((memberId) =>
            mergedArray.find((member) => member.member_id === memberId)
        );

        res.status(200).json({
            error: null,
            data: {
                members,
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

// Invite members to the organization
router.post("/members/invite", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, email, hasAdminRole } = req.body;

        let inviteData = {
            organization_id: process.env.STYTCH_ORG_ID,
            name,
            email_address: email,
            invite_redirect_url: "http://localhost:3000/authenticate",
            roles: hasAdminRole ? ["admin"] : ["viewer"],
        };

        await stytchClient.magicLinks.email.invite(
            {
                ...inviteData,
            },
            {
                authorization: {
                    session_jwt: req.headers.authorization.split(" ")[1],
                },
            }
        );

        res.status(200).json({
            error: null,
            data: {
                invite_sent: true,
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

// Get details of a specific member
router.get("/members/:memberId", isAuthenticated, async (req, res) => {
    try {
        const { memberId } = req.params;

        // Retrieve the user form the db first to check their status
        const user = await prisma.user.findUnique({
            where: { member_id: memberId },
        });

        // If user status is `inactive`, return
        if (user.status === "inactive") {
            return res.status(200).json({
                error: null,
                data: {
                    member: user,
                },
            });
        }

        const { member } = await stytchClient.organizations.members.get({
            member_id: memberId,
            organization_id: process.env.STYTCH_ORG_ID,
        });

        res.status(200).json({
            error: null,
            data: {
                member: {
                    ...member,
                    step_up_auth_enabled: user.step_up_auth_enabled,
                },
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

// Update a member
router.put(
    "/members/:memberId/update",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
        try {
            const { userSettings } = req.body;

            let updateData = {
                organization_id: process.env.STYTCH_ORG_ID,
                member_id: req.params.memberId,
                mfa_enrolled: userSettings.mfaEnabled,
                roles: userSettings.hasAdminRole ? ["user", "admin"] : ["user"],
            };

            // Update DB
            await prisma.user.update({
                where: { member_id: req.params.memberId },
                data: { step_up_auth_enabled: userSettings.stepUpAuthEnabled },
            });

            const { member } = await stytchClient.organizations.members.update(
                {
                    ...updateData,
                },
                {
                    authorization: {
                        session_jwt: req.headers.authorization.split(" ")[1],
                    },
                }
            );

            res.status(200).json({
                error: null,
                data: {
                    member,
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
    }
);

// Delete/reactivate a member -> For admins
router.put(
    "/members/:memberId/toggle-active-status",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
        try {
            const memberId = req.params.memberId;

            // Check user status in DB
            const user = await prisma.user.findUnique({
                where: { member_id: memberId },
            });

            // If user is active, delete
            if (user.status === "active") {
                const { member_id } =
                    await stytchClient.organizations.members.delete(
                        {
                            organization_id: process.env.STYTCH_ORG_ID,
                            member_id: memberId,
                        },
                        {
                            authorization: {
                                session_jwt:
                                    req.headers.authorization.split(" ")[1],
                            },
                        }
                    );

                // Update DB
                await prisma.user.update({
                    where: { member_id: member_id },
                    data: { status: "inactive" },
                });

                res.status(200).json({
                    error: null,
                    data: {
                        member_id,
                    },
                });
            } else {
                // Reactivate user
                const { member_id } =
                    await stytchClient.organizations.members.reactivate(
                        {
                            organization_id: process.env.STYTCH_ORG_ID,
                            member_id: memberId,
                        },
                        {
                            authorization: {
                                session_jwt:
                                    req.headers.authorization.split(" ")[1],
                            },
                        }
                    );

                // Update DB
                await prisma.user.update({
                    where: { member_id: member_id },
                    data: { status: "active" },
                });

                res.status(200).json({
                    error: null,
                    data: {
                        member_id,
                    },
                });
            }
        } catch (error) {
            res.status(500).json({
                error: {
                    type: error.error_type,
                    message: error.error_message,
                },
                data: null,
            });
        }
    }
);

// Deactivate account -> For users
router.delete(
    "/members/:memberId/deactivate",
    isAuthenticated,
    async (req, res) => {
        try {
            const memberId = req.params.memberId;

            // Retrieve user from DB
            const user = await prisma.user.findUnique({
                where: { member_id: memberId },
            });

            // If user has step-up auth enabled, require OTP verification
            if (user.step_up_auth_enabled) {
                res.status(200).json({
                    error: null,
                    data: {
                        message:
                            "You need to complete a MFA step to deactivate your account",
                    },
                });
            } else {
                // Make sure the user status is `active`
                if (user.status === "active") {
                    const { member_id } =
                        await stytchClient.organizations.members.delete(
                            {
                                organization_id: process.env.STYTCH_ORG_ID,
                                member_id: memberId,
                            },
                            {
                                authorization: {
                                    session_jwt:
                                        req.headers.authorization.split(" ")[1],
                                },
                            }
                        );

                    // Update DB
                    await prisma.user.update({
                        where: { member_id: member_id },
                        data: { status: "inactive" },
                    });

                    res.status(200).json({
                        error: null,
                        data: {
                            member_id,
                        },
                    });
                }
            }
        } catch (error) {
            res.status(500).json({
                error: {
                    type: error.error_type,
                    message: error.error_message,
                },
                data: null,
            });
        }
    }
);

module.exports = router
