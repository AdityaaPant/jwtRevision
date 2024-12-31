const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "USER_APP";

const app = express();
app.use(express.json());

const users = [];

function logger(req, res, next) {
	console.log(req.method + "request came");
	next();
}
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/public/index.html");
});

app.post("/signup", logger, (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	users.push({
		username,
		password,
	});
	res.send({
		message: "you have signed up",
	});
});
app.post("/signin", logger, function (req, res) {
	const username = req.body.username;
	const password = req.body.password;

	let foundUser = null;
	for (let i = 0; i < users.length; i++) {
		if (users[i].username === username && users[i].password === password) {
			foundUser = users[i];
		}
		if (!foundUser) {
			res.json({
				message: "credential incorrect",
			});
			return;
		} else {
			const token = jwt.sign(
				{
					username: users[i].username,
				},
				JWT_SECRET
			);
			res.header("jwt", token);
			res.header("random", "harkirat");
			res.json({
				token: token,
			});
		}
	}
});

function auth(req, res, next) {
	const token = req.headers.authorization;

	if (token) {
		jwt.verify(token, JWT_SECRET, (err, decoded) => {
			if (err) {
				res.status(401).send({
					message: "Unauthorized",
				});
			} else {
				req.user = decoded;
				next();
			}
		});
	} else {
		res.status(401).send({
			message: "unauthorized",
		});
	}
}

app.get("/me", logger, auth, (req, res) => {
	const user = req.user;

	if (user) {
		res.send({
			username: user.username,
			password: user.password,
		});
	} else {
		res.status(401).send({
			message: "unauthorized",
		});
	}
});

// app.get("/todo", auth, function (req, res) {});
// app.post("/todo", auth, function (req, res) {});
// app.put("/todo", auth, function (req, res) {});
// app.delete("/todo", auth, function (req, res) {});
app.listen(3000);
