function base64url_encode(buffer) {
    return btoa(buffer)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export const JWT = {
    settings: {
        secret: Bun.env.JWT_SECRET || "secret",
        algorithm: "sha256"
    },
    sign: (payloadJson) => {
        let header = base64url_encode(JSON.stringify({ alg: JWT.settings.algorithm, typ: "JWT" }));
        let payload = base64url_encode(JSON.stringify(payloadJson));
       
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(header+"."+payload);
        hasher.update(JWT.settings.secret);
        let signature = base64url_encode(hasher.digest("base64"));

        return `${header}.${payload}.${signature}`;
    },
    verify: (token) => {
        let [header, payload, signature] = token.split(".");
        let hasher = new Bun.CryptoHasher("sha256");
        hasher.update(header+"."+payload);
        hasher.update(JWT.settings.secret);
        let expectedSignature = base64url_encode(hasher.digest("base64"));
        return signature === expectedSignature;
    }
}