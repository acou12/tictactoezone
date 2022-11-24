import express from 'express';
import cors from 'cors';
import expressWs from 'express-ws';
import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import fs from 'fs';

import { optionalToken, verifyToken } from './auth';
import { key } from './secrets';

const app = expressWs(express()).app;

app.use(express.json());
app.use(cors());

/**
 * Generate a random alpha-numeric string of length `length`.
 *
 */
function randomID(length: number): string {
	let result = '';
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

interface User {
	username: string;
	password: string;
	id: string;
}

let users: User[] = [];

// for all a-z, generate a user with username and password
for (let i = 0; i < 26; i++) {
	const username = String.fromCharCode(97 + i);
	const password = username;
	const id = i.toString();
	users.push({ username, password, id });
}

app.post('/register', (req, res) => {
	if (!req.body.username || !req.body.password) {
		res.status(400).send('You must have both a username and a password.');
		return;
	} else if (users.filter((it) => it.username === req.body.username)[0]) {
		res.status(409).send('Sorry, that user already exists.');
		return;
	}
	let newUser = {
		username: req.body.username,
		password: req.body.password,
		id: randomID(16),
	};
	users.push(newUser);
	res.json({
		token: jwt.sign(
			{
				username: newUser.username,
				id: newUser.id,
			},
			key
		),
	});
});

// POST /login
// body: { username, password }
// auth: none
// returns: { token }
app.post('/login', (req, res): any => {
	if (!req.body.username || !req.body.password)
		return res.status(400).send('WRONG.');
	let theUser = users.filter(
		(it) =>
			it.username === req.body.username && it.password === req.body.password
	)[0];
	if (!theUser) {
		return res.status(401).send('Invalid password.');
	}
	res.json({
		token: jwt.sign(
			{
				username: theUser.username,
				id: theUser.id,
			},
			key
		),
	});
});

let games: Game[] = [];
let tickets: { [ticket: string]: string } = {};

type Tile = 'x' | 'o' | '';

type GameStatus = 'WAITING' | 'ONGOING' | 'ENDED';

interface Game {
	id: string;
	players: [string?, string?]; // [x, o]
	board: Tile[][];
	moves: [number, number][];
	connections: WebSocket[];
	turn: 'x' | 'o';
	status: GameStatus;
}

// POST /game
// body: (none)
// auth: required
app.post('/game', verifyToken, (req, res): any => {
	if (!req.body.user) {
		res.status(400).send('You must be logged in to create a game.');
		return;
	}
	let newGame: Game = {
		id: randomID(16),
		players: [req.body.user.id],
		board: [
			['', '', ''],
			['', '', ''],
			['', '', ''],
		],
		moves: [],
		connections: [],
		turn: 'x',
		status: 'WAITING',
	};
	games.push(newGame);
	res.json({ gameID: newGame.id });
});

// POST /join/:gameID
// body: (none)
// auth: required
// description: adds the requesting user to the game
app.post('/join/:gameID', verifyToken, (req, res): any => {
	if (!req.body.user) {
		res.status(400).send('You must be logged in to join a game.');
		return;
	}
	let game = games.filter((it) => it.id === req.params.gameID)[0];
	if (!game) {
		res.status(404).send('No game with that ID.');
		return;
	}
	if (game.players.length === 2) {
		res.status(400).send('That game is full.');
		return;
	}
	game.players.push(req.body.user.id);
	if (game.players.length >= 2) {
		game.status = 'ONGOING';
		game.connections.forEach((connection) =>
			connection.send(
				JSON.stringify({
					type: 'status',
					status: game.status,
				})
			)
		);
	}
	res.json({});
});

function generateTicket(uid: string): string {
	let ticket = randomID(16);
	tickets[ticket] = uid;
	return ticket;
}

type Role = 'x' | 'o' | false;

// GET /game/:gameID
// body: (none)
// auth: optional
// description: returns the game state, the "role" of the requesting user, and a ticket if the
// user is a player in the game. the "role" determines whether the player can make moves.
app.get('/game/:gameID', optionalToken, (req, res): any => {
	let game = games.filter((it) => it.id === req.params.gameID)[0];
	if (!game) {
		res.status(404).send('No game with that ID.');
		return;
	}
	let role: Role = false;
	if (req.body && req.body.user) {
		const roleN = game.players.indexOf(req.body.user.id);
		if (roleN > -1) {
			role = roleN === 0 ? 'x' : 'o';
			let ticket = generateTicket(req.body.user.id);
			res.json({
				board: game.board,
				turn: game.turn,
				status: game.status,
				moves: game.moves,
				role,
				ticket,
			});
			return;
		}
	}
	res.json({
		board: game.board,
		turn: game.turn,
		status: game.status,
		moves: game.moves,
		role,
	});
});

app.get('/restricted', verifyToken, (req, res) => {
	res.send(`Your username is ${req.body.user.username}. :)`);
});

// GET /info
// body: (none)
// auth: none
// description: returns a detailed JSON object containing information about the server.
app.get('/info', (req, res): any => {
	res.json({
		users: users.map((it) => ({
			id: it.id,
			username: it.username,
		})),
		games: games.map((it) => ({
			id: it.id,
			players: it.players.map((it) => ({
				id: it,
			})),
		})),
		tickets: Object.keys(tickets).map((it) => ({
			ticket: it,
			uid: tickets[it],
		})),
	});
});

// This is the primary websocket endpoint for games.
// It is used to send moves and receive notifications.
app.ws('/game/:gameID', (ws, req): any => {
	let game = games.filter((it) => it.id === req.params.gameID)[0];
	if (!game) {
		ws.send(
			JSON.stringify({
				type: 'error',
				error: 'No game with that ID.',
			})
		);
		ws.close();
		return;
	}
	let role: Role = false;
	if (req.query.ticket) {
		if ((req.query.ticket as string) in tickets) {
			const uid = tickets[req.query.ticket as string];
			const roleN = game.players.indexOf(uid);
			if (roleN > -1) {
				role = roleN === 0 ? 'x' : 'o';
				game.connections.push(ws);
				ws.on('message', (msg) => {
					let data = JSON.parse(msg.toString());
					if (data.type === 'move') {
						if (role === game.turn) {
							let [x, y] = data.move;
							if (x < 0 || x > 2 || y < 0 || y > 2 || game.board[x][y] !== '') {
								ws.send(
									JSON.stringify({
										type: 'error',
										error: 'Invalid move.',
									})
								);
								return;
							}
							game.board[x][y] = role;
							game.turn = role === 'x' ? 'o' : 'x';
							game.connections.forEach((it) => {
								it.send(
									JSON.stringify({
										type: 'move',
										move: [x, y],
										role: role,
									})
								);
							});
							game.moves.push([x, y]);
							const winner = gameOver(game);
							if (winner !== undefined) {
								game.connections.forEach((it) => {
									it.send(
										JSON.stringify({
											type: 'status',
											status: 'ENDED',
										})
									);
								});
							}
						} else {
							ws.send(
								JSON.stringify({
									type: 'error',
									error: 'It is not your turn.',
								})
							);
						}
					} else if (data.type === 'action') {
						game.connections.forEach((it) => {
							if (it !== ws) {
								it.send(JSON.stringify(data));
							}
						});
						if (data.action === 'resign') {
							game.status === 'ENDED';
							game.connections.forEach((it) => {
								it.send(
									JSON.stringify({
										type: 'status',
										status: 'ENDED',
									})
								);
							});
						} else if (data.action === 'accept_draw') {
							game.status === 'ENDED';
							game.connections.forEach((it) => {
								it.send(
									JSON.stringify({
										type: 'status',
										status: 'ENDED',
									})
								);
							});
						}
					}
				});
			}
		} else {
			ws.send(
				JSON.stringify({
					type: 'error',
					error: 'Invalid ticket.',
				})
			);
			ws.close();
			return;
		}
	} else {
		game.connections.push(ws);
	}
});

// fear
const gameOver = (game: Game): 'x' | 'o' | undefined => {
	if (
		(game.board[0][2] == 'o' &&
			game.board[1][2] == 'o' &&
			game.board[2][2] == 'o') ||
		(game.board[0][1] == 'o' &&
			game.board[1][1] == 'o' &&
			game.board[2][1] == 'o') ||
		(game.board[0][0] == 'o' &&
			game.board[1][0] == 'o' &&
			game.board[2][0] == 'o') ||
		(game.board[0][0] == 'o' &&
			game.board[0][1] == 'o' &&
			game.board[0][2] == 'o') ||
		(game.board[1][0] == 'o' &&
			game.board[1][1] == 'o' &&
			game.board[1][2] == 'o') ||
		(game.board[2][0] == 'o' &&
			game.board[2][1] == 'o' &&
			game.board[2][2] == 'o') ||
		(game.board[0][0] == 'o' &&
			game.board[1][1] == 'o' &&
			game.board[2][2] == 'o') ||
		(game.board[2][2] == 'o' &&
			game.board[1][1] == 'o' &&
			game.board[0][0] == 'o')
	) {
		return 'o';
	}
	if (
		(game.board[0][2] == 'x' &&
			game.board[1][2] == 'x' &&
			game.board[2][2] == 'x') ||
		(game.board[0][1] == 'x' &&
			game.board[1][1] == 'x' &&
			game.board[2][1] == 'x') ||
		(game.board[0][0] == 'x' &&
			game.board[1][0] == 'x' &&
			game.board[2][0] == 'x') ||
		(game.board[0][0] == 'x' &&
			game.board[0][1] == 'x' &&
			game.board[0][2] == 'x') ||
		(game.board[1][0] == 'x' &&
			game.board[1][1] == 'x' &&
			game.board[1][2] == 'x') ||
		(game.board[2][0] == 'x' &&
			game.board[2][1] == 'x' &&
			game.board[2][2] == 'x') ||
		(game.board[0][0] == 'x' &&
			game.board[1][1] == 'x' &&
			game.board[2][2] == 'x') ||
		(game.board[2][2] == 'x' &&
			game.board[1][1] == 'x' &&
			game.board[0][0] == 'x')
	) {
		return 'x';
	}
};

interface BlogPost {
	id: string;
	title: string;
	description: string;
	body: string;
	img: string;
}

let posts: BlogPost[] = [];

/**
 * Return a list of blog posts without the full body.
 */
app.get('/blog', (req, res): any => {
	res.json(
		posts.map((it) => ({
			id: it.id,
			title: it.title,
			description: it.description,
			img: it.img,
		}))
	);
});

app.get('/blog/refresh', (req, res): any => {
	posts = loadPages();
	res.status(200).end();
});

app.get('/blog/:id', (req, res): any => {
	let blog = posts.filter((it) => it.id === req.params.id)[0];
	if (blog) {
		res.json(blog);
	} else {
		res.status(404).send("That post doesn't exist.");
	}
});

interface BlogPost {
	id: string;
	title: string;
	description: string;
	body: string;
	img: string;
}

/** Load all pages from /blog/*.md into the posts array.
 * Each post has a title, starting with '# ', and a
 * description, starting with '## '.
 */
function loadPages() {
	const posts: BlogPost[] = [];
	const files = fs.readdirSync('./blog');
	files.forEach((file) => {
		const content = fs.readFileSync(`./blog/${file}`, 'utf8');
		const lines = content.split('\n');
		const title = lines[0].replace('# ', '');
		const description = lines[1].replace('## ', '');
		const body = lines.slice(2).join('\n');
		const img = `./blog/img/${file.replace('.md', '.jpg')}`;
		posts.push({
			id: file.replace('.md', ''),
			title,
			description,
			body,
			img,
		});
	});
	return posts;
}

app.listen(4000, () => console.log('Listening on port 4000!'));
