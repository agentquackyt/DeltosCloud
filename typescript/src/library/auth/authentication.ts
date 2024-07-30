import { Database } from "bun:sqlite";
import { Output } from "../misc/logger";
import { JWT } from "./jwt";

const userDatabase = new Database(process.cwd()+"/config/database/users.sqlite", { create: true});

//  create prompt to create table users with an unique username and password and an unique IDID
await userDatabase.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, email TEXT UNIQUE, password TEXT)");

export const Authentication = {
    createAccount: async (username: string, password: string, email: string) => {
        if(await userDatabase.prepare("SELECT * FROM users WHERE username = $username OR email = $email").get({$email: email, $username: username}) != undefined) {
            Output.error("User already exists");
            return false;
        }
        await userDatabase.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, Bun.password.hashSync(password), email]);

        return Authentication.login(username, password);
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
        let user: any = await userDatabase.prepare("SELECT * FROM users WHERE username = $username OR email = $username").get({$username: username});
        if(user == undefined) {
            Output.error("User does not exist");
            return false
        };

        if(!(await Bun.password.verify(password, user.password))) return false;
        // Create JWT token without libary
        let timestamp = Date.now() + 1000 * 60 * 60 * 24
        let payload = {
            sub: user.id,
            name: user.username,
            exp: timestamp
        }
        
        return {token: JWT.sign(payload), timestamp };
    },
    verifyJWT: async (req: Request): Promise<boolean> => {
        const cookies = {};
        req.headers.get("cookie")?.split(";").forEach((cookie: string) => {
            let [key, value] = cookie.split("=");
            cookies[key.trim()] = value;
        });

        if(cookies["token"] == undefined) return false;

        return JWT.verify(cookies["token"]);
    },
    getUserFromJWT: async (req: Request): Promise<Object | boolean> => {
        if(await Authentication.verifyJWT(req) == false) return false;
        
        
        return true;
    }
};

export const reCAPTCHA = {
    validate: async (token: string): Promise<boolean> => {
        const secret = Bun.env.RECAPTCHA_SECRET || "";

        const formData = new FormData();
        formData.append("secret", secret);
        formData.append("response", token);
        let response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            body: formData
        });
        Output.validation("Validating reCAPTCHA token");
        let json = await response.json();
        return json.sucess as boolean;
    }
}
