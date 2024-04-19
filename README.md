# infoplus-compiler

This is part of the infoplus project, and its job is to compile C++ code that is sent to `/compile`. It logs the code it receives to the console, and waits for confirmation whether to run it or not.

# How it works

- A request is made to `/compile`
- The request is placed into an execution queue
- Once the request's turn arrives, the server asks the user whether to execute the request code payload
- If the user accepts, the server spawns a process that executes the `g++ -o {inputFileName} {outputExecutable}`, where `inputFileName` and `outputExecutable` are both random file names. Both the input and the output files are placed in a `comps` folder
- The server then extracts the necessary information (result, memory used, execution time) and sends it to the client

# How to run

- install dependencies through `npm install`
- run `node server.js`
