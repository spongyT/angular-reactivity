import express, {Request, Response} from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Swagger-Konfiguration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User CRUD API",
      version: "1.0.0",
      description: "Eine simple CRUD REST API für Nutzer"
    }
  },
  apis: ["./src/index.ts"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Nutzer-Typ
interface User {
  id: number;
  firstName: string;
  lastName: string;
}

// In-Memory Datenbank
let users: User[] = [
  {id: 1, firstName: "John", lastName: "Doe",},
  {id: 2, firstName: "Emma", lastName: "Miller",},
  {id: 3, firstName: "Liam", lastName: "Brown",},
  {id: 4, firstName: "Olivia", lastName: "Wilson",},
  {id: 5, firstName: "Noah", lastName: "Taylor",},
  {id: 6, firstName: "Ava", lastName: "Anderson",},
  {id: 7, firstName: "James", lastName: "Thomas",},
  {id: 8, firstName: "Sophia", lastName: "Jackson",},
  {id: 9, firstName: "Lucas", lastName: "White",},
  {id: 10, firstName: "Mia", lastName: "Harris",}
];
let nextId = 1;

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Legt einen neuen User an
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - name
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User erstellt
 */
app.post("/users", (req: Request, res: Response) => {
  const {firstName, lastName} = req.body;
  const newUser = {id: nextId++, firstName, lastName};
  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Gibt alle User zurück
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste aller User
 */
app.get("/users", (req: Request, res: Response) => {
  res.json(users);
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Gibt einen einzelnen User zurück
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gefundener User
 *       404:
 *         description: User nicht gefunden
 */
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({message: "User not found"});
  res.json(user);
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Aktualisiert einen User
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User aktualisiert
 *       404:
 *         description: User nicht gefunden
 */
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const {firstName, lastName} = req.body;

  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({message: "User not found"});

  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;

  res.json(user);
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Löscht einen User
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User gelöscht
 */
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  users = users.filter((u) => u.id !== id);
  res.status(204).send();
});

process.on("SIGINT", () => {
  console.log("SIGINT empfangen, beende Server…");
  process.exit(0);
});

/* ========== SERVER START ========== */
app.listen(3000, () => {
  console.log("Server läuft: http://localhost:3000");
  console.log("Swagger UI: http://localhost:3000/api-docs");
});