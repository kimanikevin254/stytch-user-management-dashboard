import axios from "axios";

const getSessionJwt = () => {
    const sessionJwt = localStorage.getItem("stytch_session_jwt");
    return sessionJwt ? sessionJwt : null;
};

// Create an axios instance
const apiClient = axios.create({
    baseURL: "http://localhost:3001",
});

// Add a request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const sessionJwt = getSessionJwt(); // Retrieve the session JWT

        if (sessionJwt) {
            config.headers.Authorization = `Bearer ${sessionJwt}`;
        } // Attach token to Authorization header

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => response, // Return response if successful

    async (error) => {
        // Check if error is due to unauthorized access and redirect to login page
        if (error.response.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }

        // Check if the error is due to non-admins trying to access the user management dashboard
        if (error.response.status === 403) {
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;