import { Router } from "./route";
import { Color, Output } from "./../misc/logger";


/*
let router_list: Router[] = [];

export let app = {
    use: (routes: Router) => {
        router_list.push(routes);
    }
}

const port = Bun.env.PORT || 4000;

export let server = Bun.serve({
    port: port,
    fetch(req: Request): Response | Promise<Response> | any {
        Output.http(req);
        let url: string = new URL(req.url).pathname;
        for (let i = 0; i < router_list.length; i++) {
            const router = router_list[i];
            if(url.startsWith(router.getBaseRoute) || url.startsWith(router.getBaseRoute.slice(0, -1))) {
                let router_callback = router.run(req)
                if(router_callback != undefined) return router_callback;
            }
        }
        Output.error("Fallback to default 404")
        return new Response(Bun.file("./res/frontend/views/404.html"), {status: 404});
    }
})
    */


export class App {
    routerList: Router[];
    port: string | number;
    server: import("bun").Server;

    constructor() {
      this.routerList = [];
      this.port = Bun.env.PORT || 4000;
      this.handleRequest = this.handleRequest.bind(this);
    }
  
    use(router: Router): void {
      this.routerList.push(router);
    }
  
    start({ port, callback }: { port?: number; callback?: (port: number) => void; } = {}): import("bun").Server {
        this.server = Bun.serve({
            port: port || this.port,
            fetch: this.handleRequest,
        });

        if (callback !== undefined) callback(this.server.port);
      return this.server;
    }
  
    handleRequest(req: Request): Response | Promise<Response> | any {
      Output.http(req);
      let url = new URL(req.url).pathname;
      for (let router of this.routerList) {
        if (url.startsWith(router.getBaseRoute) || url.startsWith(router.getBaseRoute.slice(0, -1))) {
          let routerCallback = router.run(req);
          if (routerCallback !== undefined) return routerCallback;
        }
      }
      Output.error("Fallback to default 404");
      return Response.json({ error: "Not found" }, { status: 404 });
    }
  }
  
