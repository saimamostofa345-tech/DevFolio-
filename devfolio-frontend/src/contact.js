import api from "./axios";

export const contactApi = {
    send: async (payload) => {
        const response = await api.post(
            "/contact/",
            payload
        );

        return response.data;
    },
};