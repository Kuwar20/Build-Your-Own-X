const net = require("net");

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });

    socket.on("data", (data) => {
        const request = data.toString();
        console.log("Request: \n" + request);

        const url = request.split(" ")[1];
        
        if (url == "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else if (url.includes("/echo/")) {
            const content = url.split("/echo/")[1];
            socket.write(
                `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`
            );
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is running on port 4221");
});
