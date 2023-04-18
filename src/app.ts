import { Server } from "./server";

new Server().start().then(()=>{
    console.log("Server is running")
})