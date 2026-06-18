import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, "uploads/");
    },

    filename: (_, file, cb) => {
        const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,

    fileFilter: (_, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        } else {
        cb(
            new Error(
            "File harus berupa gambar"
            )
        );
        }
    },

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default upload;