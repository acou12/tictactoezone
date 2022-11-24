"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var express_ws_1 = __importDefault(require("express-ws"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var fs_1 = __importDefault(require("fs"));
var auth_1 = require("./auth");
var secrets_1 = require("./secrets");
var app = (0, express_ws_1["default"])((0, express_1["default"])()).app;
app.use(express_1["default"].json());
app.use((0, cors_1["default"])());
/**
 * Generate a random alpha-numeric string of length `length`.
 *
 */
function randomID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
var users = [];
// for all a-z, generate a user with username and password
for (var i = 0; i < 26; i++) {
    var username = String.fromCharCode(97 + i);
    var password = username;
    var id = i.toString();
    users.push({ username: username, password: password, id: id });
}
app.post('/register', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.status(400).send('You must have both a username and a password.');
        return;
    }
    else if (users.filter(function (it) { return it.username === req.body.username; })[0]) {
        res.status(409).send('Sorry, that user already exists.');
        return;
    }
    var newUser = {
        username: req.body.username,
        password: req.body.password,
        id: randomID(16)
    };
    users.push(newUser);
    res.json({
        token: jsonwebtoken_1["default"].sign({
            username: newUser.username,
            id: newUser.id
        }, secrets_1.key)
    });
});
// POST /login
// body: { username, password }
// auth: none
// returns: { token }
app.post('/login', function (req, res) {
    if (!req.body.username || !req.body.password)
        return res.status(400).send('WRONG.');
    var theUser = users.filter(function (it) {
        return it.username === req.body.username && it.password === req.body.password;
    })[0];
    if (!theUser) {
        return res.status(401).send('Invalid password.');
    }
    res.json({
        token: jsonwebtoken_1["default"].sign({
            username: theUser.username,
            id: theUser.id
        }, secrets_1.key)
    });
});
var games = [];
var tickets = {};
// POST /game
// body: (none)
// auth: required
app.post('/game', auth_1.verifyToken, function (req, res) {
    if (!req.body.user) {
        res.status(400).send('You must be logged in to create a game.');
        return;
    }
    var newGame = {
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
        status: 'WAITING'
    };
    games.push(newGame);
    res.json({ gameID: newGame.id });
});
// POST /join/:gameID
// body: (none)
// auth: required
// description: adds the requesting user to the game
app.post('/join/:gameID', auth_1.verifyToken, function (req, res) {
    if (!req.body.user) {
        res.status(400).send('You must be logged in to join a game.');
        return;
    }
    var game = games.filter(function (it) { return it.id === req.params.gameID; })[0];
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
        game.connections.forEach(function (connection) {
            return connection.send(JSON.stringify({
                type: 'status',
                status: game.status
            }));
        });
    }
    res.json({});
});
function generateTicket(uid) {
    var ticket = randomID(16);
    tickets[ticket] = uid;
    return ticket;
}
// GET /game/:gameID
// body: (none)
// auth: optional
// description: returns the game state, the "role" of the requesting user, and a ticket if the
// user is a player in the game. the "role" determines whether the player can make moves.
app.get('/game/:gameID', auth_1.optionalToken, function (req, res) {
    var game = games.filter(function (it) { return it.id === req.params.gameID; })[0];
    if (!game) {
        res.status(404).send('No game with that ID.');
        return;
    }
    var role = false;
    if (req.body && req.body.user) {
        var roleN = game.players.indexOf(req.body.user.id);
        if (roleN > -1) {
            role = roleN === 0 ? 'x' : 'o';
            var ticket = generateTicket(req.body.user.id);
            res.json({
                board: game.board,
                turn: game.turn,
                status: game.status,
                moves: game.moves,
                role: role,
                ticket: ticket
            });
            return;
        }
    }
    res.json({
        board: game.board,
        turn: game.turn,
        status: game.status,
        moves: game.moves,
        role: role
    });
});
app.get('/restricted', auth_1.verifyToken, function (req, res) {
    res.send("Your username is " + req.body.user.username + ". :)");
});
// GET /info
// body: (none)
// auth: none
// description: returns a detailed JSON object containing information about the server.
app.get('/info', function (req, res) {
    res.json({
        users: users.map(function (it) { return ({
            id: it.id,
            username: it.username
        }); }),
        games: games.map(function (it) { return ({
            id: it.id,
            players: it.players.map(function (it) { return ({
                id: it
            }); })
        }); }),
        tickets: Object.keys(tickets).map(function (it) { return ({
            ticket: it,
            uid: tickets[it]
        }); })
    });
});
// This is the primary websocket endpoint for games.
// It is used to send moves and receive notifications.
app.ws('/game/:gameID', function (ws, req) {
    var game = games.filter(function (it) { return it.id === req.params.gameID; })[0];
    if (!game) {
        ws.send(JSON.stringify({
            type: 'error',
            error: 'No game with that ID.'
        }));
        ws.close();
        return;
    }
    var role = false;
    if (req.query.ticket) {
        if (req.query.ticket in tickets) {
            var uid = tickets[req.query.ticket];
            var roleN = game.players.indexOf(uid);
            if (roleN > -1) {
                role = roleN === 0 ? 'x' : 'o';
                game.connections.push(ws);
                ws.on('message', function (msg) {
                    var data = JSON.parse(msg.toString());
                    if (data.type === 'move') {
                        if (role === game.turn) {
                            var _a = data.move, x_1 = _a[0], y_1 = _a[1];
                            if (x_1 < 0 || x_1 > 2 || y_1 < 0 || y_1 > 2 || game.board[x_1][y_1] !== '') {
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    error: 'Invalid move.'
                                }));
                                return;
                            }
                            game.board[x_1][y_1] = role;
                            game.turn = role === 'x' ? 'o' : 'x';
                            game.connections.forEach(function (it) {
                                it.send(JSON.stringify({
                                    type: 'move',
                                    move: [x_1, y_1],
                                    role: role
                                }));
                            });
                            game.moves.push([x_1, y_1]);
                            var winner = gameOver(game);
                            if (winner !== undefined) {
                                game.connections.forEach(function (it) {
                                    it.send(JSON.stringify({
                                        type: 'status',
                                        status: 'ENDED'
                                    }));
                                });
                            }
                        }
                        else {
                            ws.send(JSON.stringify({
                                type: 'error',
                                error: 'It is not your turn.'
                            }));
                        }
                    }
                });
            }
        }
        else {
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid ticket.'
            }));
            ws.close();
            return;
        }
    }
    else {
        game.connections.push(ws);
    }
});
// fear
var gameOver = function (game) {
    if ((game.board[0][2] == 'o' &&
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
            game.board[0][0] == 'o')) {
        return 'o';
    }
    if ((game.board[0][2] == 'x' &&
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
            game.board[0][0] == 'x')) {
        return 'x';
    }
};
var posts = [];
/**
 * Return a list of blog posts without the full body.
 */
app.get('/blog', function (req, res) {
    res.json(posts.map(function (it) { return ({
        id: it.id,
        title: it.title,
        description: it.description,
        img: it.img
    }); }));
});
app.get('/blog/refresh', function (req, res) {
    posts = loadPages();
    res.status(200).end();
});
app.get('/blog/:id', function (req, res) {
    var blog = posts.filter(function (it) { return it.id === req.params.id; })[0];
    if (blog) {
        res.json(blog);
    }
    else {
        res.status(404).send("That post doesn't exist.");
    }
});
/** Load all pages from /blog/*.md into the posts array.
 * Each post has a title, starting with '# ', and a
 * description, starting with '## '.
 */
function loadPages() {
    var posts = [];
    var files = fs_1["default"].readdirSync('./blog');
    files.forEach(function (file) {
        var content = fs_1["default"].readFileSync("./blog/" + file, 'utf8');
        var lines = content.split('\n');
        var title = lines[0].replace('# ', '');
        var description = lines[1].replace('## ', '');
        var body = lines.slice(2).join('\n');
        var img = "./blog/img/" + file.replace('.md', '.jpg');
        posts.push({
            id: file.replace('.md', ''),
            title: title,
            description: description,
            body: body,
            img: img
        });
    });
    return posts;
}
app.listen(4000, function () { return console.log('Listening on port 4000!'); });
