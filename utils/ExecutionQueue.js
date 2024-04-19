export default class ExecutionQueue {
    #queue = [];
    #isExecuting = false;

    isExecuting() {
        return this.#isExecuting;
    }

    setExecuting(value) {
        this.#isExecuting = value;
    }

    enqueue(element) {
        this.#queue.push(element);
    }

    dequeue() {
        this.#queue.shift();
    }

    async execute(callback) {
        while (this.#queue.length !== 0) {
            await callback(this.#queue[0]).catch((err) =>
                console.error("Eroare la callback execute:", err)
            );
            this.dequeue();
        }

        this.setExecuting(false);
    }
}
