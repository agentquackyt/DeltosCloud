// Description: Testing the JWT library


let token = JWT.sign({
    sub: Math.floor(Math.random() * 100000).toString().padStart(7, '0'),
    name: "Jonas Gaden",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 3,
});
