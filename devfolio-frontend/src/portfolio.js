import api, { unwrap } from "./axios";

export const portfolioApi = {
    // Get your profile information
    profile: async () => {
        const response = await api.get("/portfolio/profile/");
        return unwrap(response.data);
    },

    // Get all skills
    skills: async (params = {}) => {
        const response = await api.get("/portfolio/skills/", {
            params,
        });
        return unwrap(response.data);
    },

    // Get work experience
    experience: async () => {
        const response = await api.get("/portfolio/experience/");
        return unwrap(response.data);
    },

    // Get education history
    education: async () => {
        const response = await api.get("/portfolio/education/");
        return unwrap(response.data);
    },

    // Get projects, with optional search and filters
    projects: async (params = {}) => {
        const response = await api.get("/portfolio/projects/", {
            params,
        });
        return unwrap(response.data);
    },

    // Get one project by its ID
    project: async (id) => {
        const response = await api.get(
            `/portfolio/projects/${id}/`
        );
        return unwrap(response.data);
    },
};