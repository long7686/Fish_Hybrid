const Queue = require('queue-fifo');
const HashMap = require('hashmap');
class Duplicate {
    constructor(maxSize) {
        this.MAX_SIZE = maxSize || 1000;
        this.queue = new Queue();
        this.hashMap = new HashMap();
    }

    insert(element) {
        if (this.queue.size() >= this.MAX_SIZE) {
            this.hashMap.delete(this.queue.dequeue());
        }
        this.queue.enqueue(element);
        this.hashMap.set(element, true);
    }

    exists(element) {
        return this.hashMap.has(element);
    }

    clearAll() {
        this.queue.clear();
        this.hashMap.clear();
    }

}

module.exports = Duplicate;