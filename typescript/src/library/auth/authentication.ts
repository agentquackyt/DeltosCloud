import { Database } from "bun:sqlite";
import { Output } from "../misc/logger";
import { JWT } from "./jwt";

const loginDatabase = new Database(":memory:");
const userDatabase = new Database(process.cwd()+"/config/database/users.sqlite", { create: true});

//  create prompt to create table users with an unique username and password and an unique IDID
await userDatabase.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, email TEXT UNIQUE, password TEXT)");

/*
JWT Token
*/
const jwt_header = JSON.stringify({
    alg: "HS256",
    typ: "JWT"
});

export const Authentication = {
    createAccount: async (username: string, password: string, email: string) => {
        if(await userDatabase.prepare("SELECT * FROM users WHERE username = $username OR email = $email").get({$email: email, $username: username}) != undefined) {
            Output.error("User already exists");
            return false;
        }

        return await userDatabase.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, Bun.password.hashSync(password)]);
    },
    getAccount: async (id: string): Promise<string> => {
        return JSON.stringify(await userDatabase.prepare("SELECT * FROM users WHERE id = ?").get(id));
    },
    verifyAccount: async (username: string, password: string): Promise<boolean> => {
        let user: any = await userDatabase.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if(user == undefined) return false;

        return await Bun.password.verify(password, user.password);
    },

    /**
     * @param username username OR email
     */
    login: async (username: string, password: string): Promise<Object | boolean> => {
        let user: any = await userDatabase.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(username, username);
        if(user == undefined) return false;

        if(!(await Bun.password.verify(password, user.password))) return false;
        // Create JWT token without libary
        let timestamp = Date.now() + 1000 * 60 * 60 * 24
        let payload = {
            sub: user.id,
            name: user.username,
            exp: timestamp
        }
        
        return {token: JWT.sign(payload), timestamp };
    }
};

