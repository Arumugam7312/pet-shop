import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("petshop.db");
const JWT_SECRET = "petshop-secret-key-123";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    breed TEXT,
    type TEXT,
    gender TEXT,
    color TEXT,
    dob TEXT,
    price REAL,
    description TEXT,
    image_url TEXT,
    health_status TEXT,
    vaccination_status TEXT,
    breeder_name TEXT,
    breeder_rating REAL,
    breeder_reviews INTEGER,
    is_available INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    address TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    payment_method TEXT,
    date TEXT,
    status TEXT,
    amount REAL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    pet_id INTEGER,
    pet_name TEXT,
    pet_price REAL,
    pet_image TEXT,
    pet_condition TEXT,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );
`);

// Migration for existing orders table
try {
  db.exec("ALTER TABLE orders ADD COLUMN customer_email TEXT");
  db.exec("ALTER TABLE orders ADD COLUMN customer_phone TEXT");
  db.exec("ALTER TABLE orders ADD COLUMN address TEXT");
  db.exec("ALTER TABLE orders ADD COLUMN district TEXT");
  db.exec("ALTER TABLE orders ADD COLUMN state TEXT");
  db.exec("ALTER TABLE orders ADD COLUMN pincode TEXT");
  db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT");
  db.exec("ALTER TABLE order_items ADD COLUMN pet_condition TEXT");
  try {
    db.exec("ALTER TABLE pets ADD COLUMN is_available INTEGER DEFAULT 1");
  } catch (e) {}
} catch (e) {
  // Columns might already exist
}

// Seed Admin User
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@petshop.com");
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("admin@petshop.com", hashedPassword, "admin");
}

// Seed initial pets
const seedPets = [
  { name: "Max", breed: "Golden Retriever", type: "Dogs", gender: "Male", color: "Golden", dob: "2023-05-15", price: 1200, description: "Friendly and energetic puppy.", image_url: "https://picsum.photos/seed/dog1/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Happy Paws", breeder_rating: 4.8, breeder_reviews: 120 },
    { name: "Luna", breed: "Persian Cat", type: "Cats", gender: "Female", color: "White", dob: "2023-08-20", price: 800, description: "Calm and affectionate companion.", image_url: "https://picsum.photos/seed/cat1/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Elite Felines", breeder_rating: 4.9, breeder_reviews: 85 },
    { name: "Charlie", breed: "Beagle", type: "Dogs", gender: "Male", color: "Tricolor", dob: "2023-06-10", price: 950, description: "Curious and playful hound.", image_url: "https://picsum.photos/seed/dog2/800/800", health_status: "Good", vaccination_status: "Up to date", breeder_name: "Hound Haven", breeder_rating: 4.5, breeder_reviews: 60 },
    { name: "Bella", breed: "French Bulldog", type: "Dogs", gender: "Female", color: "Fawn", dob: "2023-10-05", price: 2500, description: "Sweet and low-energy apartment dog.", image_url: "https://picsum.photos/seed/dog3/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Frenchie Friends", breeder_rating: 5.0, breeder_reviews: 45 },
    { name: "Oliver", breed: "Maine Coon", type: "Cats", gender: "Male", color: "Grey Tabby", dob: "2023-04-12", price: 1500, description: "Gentle giant with a thick coat.", image_url: "https://picsum.photos/seed/cat2/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Giant Purrs", breeder_rating: 4.7, breeder_reviews: 90 },
    { name: "Sky", breed: "Blue Gold Macaw", type: "Birds", gender: "Male", color: "Blue/Yellow", dob: "2022-12-01", price: 3500, description: "Highly intelligent and talkative.", image_url: "https://picsum.photos/seed/bird1/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Avian World", breeder_rating: 4.6, breeder_reviews: 30 },
    { name: "Daisy", breed: "Holland Lop", type: "Rabbits", gender: "Female", color: "White/Brown", dob: "2023-11-15", price: 150, description: "Very soft and friendly rabbit.", image_url: "https://picsum.photos/seed/rabbit1/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Cooper", breed: "Siberian Husky", type: "Dogs", gender: "Male", color: "Black/White", dob: "2023-07-22", price: 1800, description: "High energy and very vocal.", image_url: "https://picsum.photos/seed/dog4/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Arctic Pups", breeder_rating: 4.9, breeder_reviews: 75 },
    { name: "Milo", breed: "British Shorthair", type: "Cats", gender: "Male", color: "Blue", dob: "2023-09-10", price: 1200, description: "Chunky and lovable house cat.", image_url: "https://picsum.photos/seed/cat3/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Royal Cats", breeder_rating: 4.8, breeder_reviews: 40 },
    { name: "Sunny", breed: "Cockatiel", type: "Birds", gender: "Female", color: "Yellow/Grey", dob: "2024-01-05", price: 250, description: "Sweet and musical bird.", image_url: "https://picsum.photos/seed/bird2/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Feathered Friends", breeder_rating: 4.7, breeder_reviews: 15 },
    { name: "Thumper", breed: "Mini Rex", type: "Rabbits", gender: "Male", color: "Castor", dob: "2023-12-12", price: 120, description: "Velvety fur and very calm.", image_url: "https://picsum.photos/seed/rabbit2/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 20 },
    { name: "Goldie", breed: "Fantail Goldfish", type: "Fish", gender: "Female", color: "Orange", dob: "2024-02-01", price: 25, description: "Beautiful flowing fins.", image_url: "https://picsum.photos/seed/fish1/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
    { name: "Rio", breed: "African Grey Parrot", type: "Birds", gender: "Male", color: "Grey", dob: "2023-01-15", price: 2200, description: "Incredible mimic and very smart.", image_url: "https://picsum.photos/seed/parrot1/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Avian World", breeder_rating: 4.6, breeder_reviews: 30 },
    { name: "Snowy", breed: "Netherland Dwarf", type: "Rabbits", gender: "Female", color: "White", dob: "2024-01-20", price: 180, description: "Tiny and adorable bunny.", image_url: "https://picsum.photos/seed/bunny3/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Bubbles", breed: "Koi Fish", type: "Fish", gender: "Male", color: "Red/White", dob: "2023-11-01", price: 45, description: "Graceful and elegant pond fish.", image_url: "https://picsum.photos/seed/koi1/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
    { name: "Zazu", breed: "Hornbill", type: "Birds", gender: "Male", color: "Blue/White", dob: "2023-05-12", price: 850, description: "Very talkative and loyal bird.", image_url: "https://picsum.photos/seed/bird3/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Avian World", breeder_rating: 4.6, breeder_reviews: 30 },
    { name: "Peter", breed: "Angora Rabbit", type: "Rabbits", gender: "Male", color: "White", dob: "2024-02-15", price: 200, description: "Extremely fluffy and soft.", image_url: "https://picsum.photos/seed/rabbit3/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Nemo", breed: "Clownfish", type: "Fish", gender: "Male", color: "Orange/White", dob: "2024-01-10", price: 35, description: "Iconic and vibrant reef fish.", image_url: "https://picsum.photos/seed/fish2/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
    { name: "Dory", breed: "Blue Tang", type: "Fish", gender: "Female", color: "Blue/Yellow", dob: "2023-12-05", price: 65, description: "Beautiful and active swimmer.", image_url: "https://picsum.photos/seed/fish3/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
    { name: "Mango", breed: "Sun Conure", type: "Birds", gender: "Female", color: "Orange/Yellow", dob: "2023-08-20", price: 600, description: "Vibrant colors and very playful.", image_url: "https://picsum.photos/seed/bird4/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Feathered Friends", breeder_rating: 4.7, breeder_reviews: 20 },
    { name: "Flopsy", breed: "English Spot", type: "Rabbits", gender: "Female", color: "White/Black", dob: "2023-10-10", price: 130, description: "Energetic and friendly rabbit.", image_url: "https://picsum.photos/seed/rabbit4/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Finley", breed: "Betta Fish", type: "Fish", gender: "Male", color: "Deep Blue", dob: "2024-03-01", price: 15, description: "Stunning long fins and bold color.", image_url: "https://picsum.photos/seed/fish4/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
    { name: "Buddy", breed: "Beagle", type: "Dogs", gender: "Male", color: "Brown/White", dob: "2023-11-20", price: 700, description: "Energetic and friendly beagle.", image_url: "https://picsum.photos/seed/dog5/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Happy Paws", breeder_rating: 4.8, breeder_reviews: 120 },
    { name: "Simba", breed: "Bengal Cat", type: "Cats", gender: "Male", color: "Spotted", dob: "2023-06-15", price: 2000, description: "Exotic looking and very active.", image_url: "https://picsum.photos/seed/cat4/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Elite Felines", breeder_rating: 4.9, breeder_reviews: 85 },
    { name: "Kiwi", breed: "Lovebird", type: "Birds", gender: "Female", color: "Green/Peach", dob: "2024-02-10", price: 150, description: "Small, colorful, and very social.", image_url: "https://picsum.photos/seed/bird5/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Feathered Friends", breeder_rating: 4.7, breeder_reviews: 20 },
    { name: "Clover", breed: "Lionhead Rabbit", type: "Rabbits", gender: "Female", color: "Grey", dob: "2023-12-01", price: 110, description: "Distinctive mane and very sweet.", image_url: "https://picsum.photos/seed/rabbit5/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Shadow", breed: "Black Moor Goldfish", type: "Fish", gender: "Male", color: "Black", dob: "2024-01-15", price: 20, description: "Unique telescopic eyes and velvety black color.", image_url: "https://picsum.photos/seed/fish5/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
    { name: "Rex", breed: "German Shepherd", type: "Dogs", gender: "Male", color: "Black/Tan", dob: "2023-03-10", price: 1500, description: "Intelligent, brave, and highly trainable.", image_url: "https://picsum.photos/seed/dog6/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Guardian K9s", breeder_rating: 4.7, breeder_reviews: 55 },
    { name: "Coco", breed: "Poodle", type: "Dogs", gender: "Female", color: "Chocolate", dob: "2023-12-05", price: 1800, description: "Elegant and very smart companion.", image_url: "https://picsum.photos/seed/dog7/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Poodle Palace", breeder_rating: 4.9, breeder_reviews: 40 },
    { name: "Whiskers", breed: "Siamese Cat", type: "Cats", gender: "Female", color: "Cream/Seal", dob: "2023-11-12", price: 900, description: "Vocal and very affectionate.", image_url: "https://picsum.photos/seed/cat5/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Elite Felines", breeder_rating: 4.9, breeder_reviews: 85 },
    { name: "Ginger", breed: "Abyssinian", type: "Cats", gender: "Female", color: "Ruddy", dob: "2023-08-15", price: 1100, description: "Active and curious explorer.", image_url: "https://picsum.photos/seed/cat6/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Elite Felines", breeder_rating: 4.9, breeder_reviews: 85 },
    { name: "Bluey", breed: "Budgerigar", type: "Birds", gender: "Male", color: "Blue", dob: "2024-03-01", price: 45, description: "Cheerful and easy to care for.", image_url: "https://picsum.photos/seed/bird6/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Feathered Friends", breeder_rating: 4.7, breeder_reviews: 20 },
    { name: "Peaches", breed: "Rosy-faced Lovebird", type: "Birds", gender: "Female", color: "Green/Peach", dob: "2023-10-20", price: 120, description: "Sweet-natured and colorful.", image_url: "https://picsum.photos/seed/bird7/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Feathered Friends", breeder_rating: 4.7, breeder_reviews: 20 },
    { name: "Bugs", breed: "Flemish Giant", type: "Rabbits", gender: "Male", color: "Sandy", dob: "2023-05-10", price: 250, description: "The gentle giant of the rabbit world.", image_url: "https://picsum.photos/seed/rabbit6/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Mochi", breed: "Mini Lop", type: "Rabbits", gender: "Female", color: "Broken Orange", dob: "2024-01-05", price: 140, description: "Adorable floppy ears and sweet personality.", image_url: "https://picsum.photos/seed/rabbit7/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Bunny Barn", breeder_rating: 4.8, breeder_reviews: 25 },
    { name: "Sparky", breed: "Neon Tetra", type: "Fish", gender: "Male", color: "Blue/Red", dob: "2024-02-20", price: 5, description: "Small, glowing schooling fish.", image_url: "https://picsum.photos/seed/fish6/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
  { name: "Glimmer", breed: "Guppy", type: "Fish", gender: "Female", color: "Rainbow", dob: "2024-03-10", price: 8, description: "Hardy and very colorful.", image_url: "https://picsum.photos/seed/fish7/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
  { name: "Oscar", breed: "Tiger Oscar", type: "Fish", gender: "Male", color: "Black/Orange", dob: "2023-09-15", price: 55, description: "Large, intelligent, and full of personality.", image_url: "https://picsum.photos/seed/fish8/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
  { name: "Angel", breed: "Angelfish", type: "Fish", gender: "Female", color: "Silver/Black", dob: "2024-01-20", price: 30, description: "Graceful and majestic swimmer.", image_url: "https://picsum.photos/seed/fish9/800/800", health_status: "Excellent", vaccination_status: "N/A", breeder_name: "Aqua Life", breeder_rating: 4.5, breeder_reviews: 10 },
  { name: "Spike", breed: "Bulldog", type: "Dogs", gender: "Male", color: "White/Brindle", dob: "2023-02-14", price: 2800, description: "Courageous and kind, a true friend.", image_url: "https://picsum.photos/seed/dog8/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Guardian K9s", breeder_rating: 4.7, breeder_reviews: 55 },
  { name: "Mittens", breed: "Ragdoll", type: "Cats", gender: "Female", color: "Pointed Blue", dob: "2023-12-25", price: 1600, description: "Docile and affectionate lap cat.", image_url: "https://picsum.photos/seed/cat7/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Elite Felines", breeder_rating: 4.9, breeder_reviews: 85, is_available: 1 },
  { name: "Sold Out Pup", breed: "Pug", type: "Dogs", gender: "Male", color: "Fawn", dob: "2023-01-01", price: 500, description: "Already found a home.", image_url: "https://picsum.photos/seed/dog9/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Happy Paws", breeder_rating: 4.8, breeder_reviews: 120, is_available: 0 },
  { name: "Adopted Kitty", breed: "Tabby", type: "Cats", gender: "Female", color: "Orange", dob: "2023-01-01", price: 100, description: "Already found a home.", image_url: "https://picsum.photos/seed/cat8/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Elite Felines", breeder_rating: 4.9, breeder_reviews: 85, is_available: 0 },
  { name: "Reserved Bird", breed: "Canary", type: "Birds", gender: "Male", color: "Yellow", dob: "2023-01-01", price: 50, description: "Reserved for a customer.", image_url: "https://picsum.photos/seed/bird8/800/800", health_status: "Excellent", vaccination_status: "Up to date", breeder_name: "Feathered Friends", breeder_rating: 4.7, breeder_reviews: 20, is_available: 0 },
];

const insertPet = db.prepare(`
  INSERT INTO pets (name, breed, type, gender, color, dob, price, description, image_url, health_status, vaccination_status, breeder_name, breeder_rating, breeder_reviews, is_available)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkPet = db.prepare("SELECT id FROM pets WHERE name = ? AND breed = ?");

for (const pet of seedPets) {
  const exists = checkPet.get(pet.name, pet.breed);
  if (!exists) {
    insertPet.run(pet.name, pet.breed, pet.type, pet.gender, pet.color, pet.dob, pet.price, pet.description, pet.image_url, pet.health_status, pet.vaccination_status, pet.breeder_name, pet.breeder_rating, pet.breeder_reviews, pet.is_available ?? 1);
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ error: "Forbidden" });
  };

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ id: user.id, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json(decoded);
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // API Routes
  app.get("/api/pets", (req, res) => {
    const { type, gender, minPrice, maxPrice, search } = req.query;
    let query = "SELECT * FROM pets WHERE 1=1";
    const params: any[] = [];

    if (type && type !== "All") {
      query += " AND type = ?";
      params.push(type);
    }
    if (gender && gender !== "All") {
      query += " AND gender = ?";
      params.push(gender);
    }
    if (minPrice) {
      query += " AND price >= ?";
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += " AND price <= ?";
      params.push(Number(maxPrice));
    }
    if (search) {
      query += " AND (name LIKE ? OR breed LIKE ? OR description LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    const pets = db.prepare(query).all(...params);
    res.json(pets);
  });

  app.get("/api/pets/:id", (req, res) => {
    const pet = db.prepare("SELECT * FROM pets WHERE id = ?").get(req.params.id);
    if (pet) {
      res.json(pet);
    } else {
      res.status(404).json({ error: "Pet not found" });
    }
  });

  // Admin Pet Management
  app.post("/api/admin/pets", authenticate, isAdmin, (req, res) => {
    const { name, breed, type, gender, color, dob, price, description, image_url, health_status, vaccination_status, breeder_name, breeder_rating, breeder_reviews } = req.body;
    const result = db.prepare(`
      INSERT INTO pets (name, breed, type, gender, color, dob, price, description, image_url, health_status, vaccination_status, breeder_name, breeder_rating, breeder_reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, breed, type, gender, color, dob, price, description, image_url, health_status, vaccination_status, breeder_name, breeder_rating, breeder_reviews);
    
    io.emit("pet:added", { id: result.lastInsertRowid, ...req.body });
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/pets/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("DELETE FROM pets WHERE id = ?").run(req.params.id);
    io.emit("pet:deleted", { id: req.params.id });
    res.json({ success: true });
  });

  // Order Management
  app.post("/api/orders", (req, res) => {
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      address, 
      district, 
      state, 
      pincode, 
      payment_method,
      amount,
      items
    } = req.body;
    
    const id = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const status = "PENDING";
    
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, district, state, pincode, payment_method, date, status, amount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, pet_id, pet_name, pet_price, pet_image, pet_condition)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertOrder.run(id, customer_name, customer_email, customer_phone, address, district, state, pincode, payment_method, date, status, amount);
      if (items && Array.isArray(items)) {
        for (const item of items) {
          insertItem.run(id, item.id, item.name, item.price, item.image_url, item.condition || 'Excellent');
        }
      }
    });

    transaction();
    
    const stats = getStats();
    io.emit("order:placed", { 
      id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      address, 
      district, 
      state, 
      pincode, 
      payment_method,
      date, 
      status, 
      amount, 
      items,
      stats 
    });
    res.json({ id });
  });

  app.get("/api/admin/orders/:id/items", authenticate, isAdmin, (req, res) => {
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(req.params.id);
    res.json(items);
  });

  app.get("/api/public/orders/:id", (req, res) => {
    const order = db.prepare("SELECT id, customer_name, date, status, amount FROM orders WHERE id = ?").get(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    const items = db.prepare("SELECT pet_name, pet_price, pet_image FROM order_items WHERE order_id = ?").all(req.params.id);
    res.json({ ...order, items });
  });

  app.patch("/api/admin/orders/:id/status", authenticate, isAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
      const stats = getStats();
      io.emit("order:updated", { id, status, stats });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  const getStats = () => {
    const totalPets = db.prepare("SELECT COUNT(*) as count FROM pets").get() as { count: number };
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM orders").get() as { total: number };
    const totalCustomers = db.prepare("SELECT COUNT(DISTINCT customer_email) as count FROM orders").get() as { count: number };
    return {
      totalPets: totalPets.count,
      totalOrders: totalOrders.count,
      totalRevenue: totalRevenue.total || 0,
      totalCustomers: totalCustomers.count,
      distribution: { male: 520, female: 728, imported: 150 }
    };
  };

  app.get("/api/admin/stats", authenticate, isAdmin, (req, res) => {
    res.json(getStats());
  });

  app.get("/api/admin/orders", authenticate, isAdmin, (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY date DESC").all();
    res.json(orders);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
