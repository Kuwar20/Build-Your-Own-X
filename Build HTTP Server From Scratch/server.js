const net = require("net");

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });

    socket.on("data", (data) => {
        console.log(data);
        const path = data.toString().split(" ")[1];
        const responseStatus = path === "/home" ? "200 OK" : "404 Not Found";
        socket.write(`HTTP/1.1 ${responseStatus}\r\n\r\n`);
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is running on port 4221");
});
