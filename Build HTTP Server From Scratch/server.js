const net = require("net");

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost", ()=>{
    console.log("Server is running on port 4221");
});
