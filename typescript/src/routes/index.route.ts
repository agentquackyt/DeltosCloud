import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import indexHtml from "../frontend/html/index.html" with { type: "text" };
// @ts-expect-error
import loginHtml from "../frontend/html/login.html" with { type: "text" };
// @ts-expect-error
import registerHtml from "../frontend/html/register.html" with { type: "text" };
import manifestJson from "../frontend/html/manifest.json";
import { Authentication, reCAPTCHA } from "../library/auth/authentication";

const sendIndex = async (req: Request) => {
    if (await Authentication.verifyJWT(req) == false) return Response.redirect("/login");
    return new Response(await translateString({ file: indexHtml, req }), contentType);
};

const router = new Router("/")
    .get("/", sendIndex)
    .get("/settings", sendIndex)
    .get("/f/:folder", sendIndex)
    .get("/v/:file", sendIndex)
    
    .get("/login", async (req) => {
        return new Response(await translateString({ file: loginHtml, req }), contentType);
    })
    .get("/logout", async (req) => {
        return new Response(JSON.stringify(["Logging out ... "]), {
            status: 301,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "token=; expires=" + new Date(0).toUTCString(),
                "Location": "/login"
            }
        });
    })
    .get("/register", async (req) => {
        return new Response(await translateString({ file: registerHtml, req }), contentType);
    })
    .post("/register", async (req) => {
        let formdata = await req.formData();
        console.log(formdata);
        if(!formdata.has("g-recaptcha-response") || formdata.get("g-recaptcha-response") === "") return Response.redirect("/register?error=no-captcha");
        if(!formdata.has("email") || !formdata.has("username") || !formdata.has("password")) return Response.redirect("/register?error=missing-data");
        const username = formdata.get("username") as string;
        const email = formdata.get("email") as string;
        const password = formdata.get("password") as string;
        const captcha = formdata.get("g-recaptcha-response") as string;

        if(!reCAPTCHA.validate(captcha)) return Response.redirect("/register?error=invalid-captcha");

        let account = await Authentication.createAccount(username, password, email);
        if(account == false) return Response.redirect("/register?error=user-exists");

        // @ts-ignore
        let { token, timestamp } = account;
        return new Response(JSON.stringify({ token }), {
            status: 301,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "token=" + token + "; expires=" + new Date(timestamp).toUTCString(),
                "Location": "/"
            }
        });
    })
    .post("/login", async (req) => {
        const formdata = await req.formData();
        const username = formdata.get("username") as string;
        const password = formdata.get("password") as string;
        let tokenPromise = await Authentication.login(username, password);
        if (tokenPromise == false) return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
        // @ts-ignore
        let { token, timestamp } = tokenPromise;
        return new Response(JSON.stringify({ token }), {
            status: 301,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "token=" + token + "; expires=" + new Date(timestamp).toUTCString(),
                "Location": "/"
            }
        });
    })
    .get('/manifest.json', (req) => {
        return new Response(JSON.stringify(manifestJson));
    });


export default router;