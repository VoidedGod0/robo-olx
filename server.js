import express from 'express';
import dotenv from 'dotenv';
import process from 'process';
import multer from 'multer';
import path from 'path';
import url from 'url';
import fs from 'fs';

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

dotenv.config();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static("static"));
app.use('/uploads', express.static(path.join(__dirname, "uploads")))
console.log(__dirname)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', 'views');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: diskStorage });

let products = [];

app.get(
    '/', 
    (req, res, next) => {
        console.log(products);
        next();
    },
    (req, res) => {
        res.render('index', { products: products });
    }
);

app.post(
    '/add', 
    upload.fields([{ name: "image" }, ]),
    (req, res) => {
        let data = req.body;
        data.image = req.files.image.map((file) => file.filename);
        data.id = products.length;
        products.push(data);
        res.redirect('/');
    }
);

app.get(
    '/post/:id',
    (req, res) => {
        const postId = req.params.id;
        if(!products[postId]){
            return res.status(404).render('notfound');
        }
        res.render('post', {product: products[postId]});
    }
);

app.use((req, res, next) => {
    res.status(404);
    res.render('notfound');
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});