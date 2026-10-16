import api, { unwrap } from "./axios";

export const blogApi = {
    // Get published posts or posts matching filters
    posts: async (params = {}) => {
        const response = await api.get("/blog/posts/", {
            params,
        });
        return unwrap(response.data);
    },

    // Get a single post
    post: async (id) => {
        const response = await api.get(
            `/blog/posts/${id}/`
        );
        return unwrap(response.data);
    },

    // Get blog categories
    categories: async () => {
        const response = await api.get(
            "/blog/categories/"
        );
        return unwrap(response.data);
    },

    // Get blog tags
    tags: async () => {
        const response = await api.get("/blog/tags/");
        return unwrap(response.data);
    },

    // Like a blog post
    like: async (id) => {
        const response = await api.post(
            `/blog/posts/${id}/like/`
        );
        return response.data;
    },

    // Submit a visitor comment for moderation
    comment: async (payload) => {
        const response = await api.post(
            "/blog/comments/",
            payload
        );
        return response.data;
    },
};