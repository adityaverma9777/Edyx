import { Router } from "express";
import { supabase } from "../lib/supabase";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token lightly
const verifyToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET!) as { email: string };
            req.user = decoded;
        } catch (e) {
            // Invalid token, just proceed as unauth
        }
    }
    next();
};

// GET all comments for a specific file
router.get("/", async (req, res) => {
    try {
        const { file_path } = req.query;
        if (!file_path || typeof file_path !== "string") {
            return res.status(400).json({ error: "Missing file_path" });
        }

        const { data, error } = await supabase
            .from("file_comments")
            .select("*")
            .eq("file_path", file_path)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching comments:", error);
            return res.status(500).json({ error: "Database error" });
        }

        return res.json({ comments: data || [] });
    } catch (err) {
        console.error("GET comments error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST a new comment
router.post("/", verifyToken, async (req: any, res: any) => {
    try {
        const { file_path, comment_text } = req.body;

        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        if (!file_path || !comment_text) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const username = req.user.email.split("@")[0];

        const { data, error } = await supabase
            .from("file_comments")
            .insert([{ file_path, username, comment_text }])
            .select()
            .single();

        if (error) {
            console.error("Error inserting comment:", error);
            return res.status(500).json({ error: "Database error" });
        }

        return res.status(201).json({ success: true, comment: data });
    } catch (err) {
        console.error("POST comment error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// UPDATE a comment
router.put("/:id", verifyToken, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { comment_text } = req.body;

        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        if (!comment_text || !id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const username = req.user.email.split("@")[0];

        // First verify ownership
        const { data: existingComment, error: fetchError } = await supabase
            .from("file_comments")
            .select("username")
            .eq("id", id)
            .single();

        if (fetchError || !existingComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (existingComment.username !== username) {
            return res.status(403).json({ error: "Forbidden: You do not own this comment" });
        }

        const { data, error } = await supabase
            .from("file_comments")
            .update({ comment_text })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating comment:", error);
            return res.status(500).json({ error: "Database error" });
        }

        return res.json({ success: true, comment: data });
    } catch (err) {
        console.error("PUT comment error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE a comment
router.delete("/:id", verifyToken, async (req: any, res: any) => {
    try {
        const { id } = req.params;

        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const username = req.user.email.split("@")[0];

        // First verify ownership
        const { data: existingComment, error: fetchError } = await supabase
            .from("file_comments")
            .select("username")
            .eq("id", id)
            .single();

        if (fetchError || !existingComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (existingComment.username !== username) {
            return res.status(403).json({ error: "Forbidden: You do not own this comment" });
        }

        const { error } = await supabase
            .from("file_comments")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting comment:", error);
            return res.status(500).json({ error: "Database error" });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error("DELETE comment error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
