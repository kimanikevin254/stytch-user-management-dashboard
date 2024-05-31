const { stytchClient } = require("../utils/stytchClient");

const isAuthenticated = async (req, res, next) => {
    try {
        const sessionJWT = req.headers.authorization.split(" ")[1];
        const { member } = await stytchClient.sessions.authenticate({
            session_jwt: sessionJWT,
        });
        req.stytchMember = member;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            error: {
                type: error.error_type,
                message: error.error_message,
            },
            data: null,
        });
    }
};

const isAdmin = (req, res, next) => {
    if (!req?.stytchMember?.roles.some((role) => role.role_id === "admin")) {
        return res.status(403).json({
            error: {
                type: "unauthorized_action",
                message: "You are not authorized to access this resource",
            },
            data: null,
        });
    }

    next();
};

module.exports = { isAuthenticated, isAdmin };