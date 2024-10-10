const net = require("net");
const fs = require("fs");
const zlib = require("zlib");

// Utility function to parse the HTTP request
const parseRequest = (requestData) => {
    const request = requestData.toString().split("\r\n");

    // Split the first line to get method, path, and protocol
    const [method, path, protocol] = request[0].split(" ");

    // Parse headers
    const headers = {};
    request.slice(1).forEach((header) => {
        const [key, value] = header.split(": ");
        if (key && value) {
            headers[key] = value;
        }
    });

    return { method, path, protocol, headers };
};

// Constants for responses
const OK_RESPONSE = "HTTP/1.1 200 OK\r\n\r\n";
const ERROR_RESPONSE = "HTTP/1.1 404 Not Found\r\n\r\n";

// Create the server
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = parseRequest(data);
        const { method, path, headers } = request;

        // Check if the client supports gzip in the Accept-Encoding header
        const acceptEncoding = headers["Accept-Encoding"] || "";
        const supportsGzip = acceptEncoding.includes("gzip");

        let responseHeaders = "HTTP/1.1 200 OK\r\n";

        // If client supports gzip, add the Content-Encoding header
        if (supportsGzip) {
            responseHeaders += "Content-Encoding: gzip\r\n";
        }

        // Handle GET request to "/"
        if (path === "/") {
            socket.write(responseHeaders + "\r\n");

        // Handle "/echo" endpoint
        } else if (path.startsWith("/echo/")) {
            const randomString = path.substring(6);
            const responseBody = `Echo: ${randomString}`;
            responseHeaders += `Content-Type: text/plain\r\nContent-Length: ${responseBody.length}\r\n\r\n${responseBody}`;
            socket.write(responseHeaders);

        // Handle "/user-agent" endpoint
        } else if (path === "/user-agent") {
            const agent = headers["User-Agent"];
            if (agent) {
                responseHeaders += `Content-Type: text/plain\r\nContent-Length: ${agent.length}\r\n\r\n${agent}`;
                socket.write(responseHeaders);
            } else {
                socket.write(ERROR_RESPONSE);
            }

        // Handle GET request to "/files/{filename}"
        } else if (path.startsWith("/files/") && method === "GET") {
            const fileName = path.replace("/files/", "").trim();
            const filePath = process.argv[3] + "/" + fileName;

            // Check if the file exists
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, "utf-8");
                responseHeaders += `Content-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
                socket.write(responseHeaders);
            } else {
                socket.write(ERROR_RESPONSE);
            }

        // Handle POST request to "/files/{filename}"
        } else if (path.startsWith("/files/") && method === "POST") {
            const fileName = path.replace("/files/", "").trim();
            const filePath = process.argv[3] + "/" + fileName;

            // Parse body from the request
            const bodyStartIndex = data.indexOf("\r\n\r\n") + 4;
            const body = data.slice(bodyStartIndex).toString();

            // Write body to the specified file
            fs.writeFileSync(filePath, body);
            socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
        } else {
            // If no route matches, send a 404 response
            socket.write(ERROR_RESPONSE);
        }

        // End the connection
        socket.end();
    });

    // Error Handling
    socket.on("error", (e) => {
        console.error("ERROR: " + e);
        socket.end();
    });

    // Closing
    socket.on("close", () => {
        socket.end();
    });
});

// Start the server and listen on port 4221
server.listen(4221, "localhost", () => {
    console.log("Server listening on localhost:4221");
});
