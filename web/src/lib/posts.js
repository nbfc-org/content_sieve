import SymbolTree from 'symbol-tree';
import uuid62 from 'uuid62';

class Thread {
    constructor(newPost) {
        this.tree = new SymbolTree();
        this.root = {};
        this.tree.initialize(this.root);
        this.lookup = {}
        this.lookup[undefined] = this.root;
    }
    get(id) {
        return this.lookup[id];
    }
    childrenCount(id) {
        return this.tree.childrenCount(this.get(id));
    }
    childIds(id) {
        return this.tree.childrenToArray(this.get(id)).map(o => o.id);
    }
    remove(id) {
        const o = this.get(id);
        this.tree.remove(o);
        delete this.lookup[id];
    }
    reply(parentId, newPost, index=[]) {
        const { id } = newPost;
        if (this.lookup.hasOwnProperty(id)) {
            throw new Error("already in tree");
        } else {
            this.lookup[id] = newPost;
            const parent = this.lookup[parentId];
            this.tree.prependChild(parent, newPost);
        }
    }
}

export { Thread };
