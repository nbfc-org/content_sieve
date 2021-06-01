import SymbolTree from 'symbol-tree';

const data = {};

const p = [
    {
        id: 'xyz-1',
        content: {
            body: "First Post - Hello world",
        },
        userId: 'abc-1',
    },
    {
        id: 'xyz-2',
        content: {
            body: "Second Post - Hello again",
        },
        userId: 'abc-1',
    },
    {
        id: 'xyz-3',
        content: {
            title: "Random Post",
            url: "https://google.com",
        },
        userId: 'abc-1',
    }
];

class Thread {
    constructor(newPost) {
        this.tree = new SymbolTree();
        this.root = {};
        this.tree.initialize(this.root);
        this.lookup = {}
        this.length = 0;
        this.lookup[undefined] = this.root;
        this.reply(undefined, newPost);
    }
    insert(newPost) {
        const { id } = newPost;
        this.lookup[id] = newPost;
        this.length += 1;
        return id;
    }
    reply(parentId, newPost) {
        const id = this.insert(newPost);
        this.tree.appendChild(this.lookup[parentId], newPost);
        return this._objectWithParent(newPost);
    }
    _objectWithParent(o) {
        const p = this.tree.parent(o);
        if (p) {
            return { parent: p.id, ...o };
        }
        return o;
    }
    toArray(id) {
        return this.tree
            .treeToArray(this.lookup[id])
            .map(o => this._objectWithParent(o));
    }
}

const thread = new Thread(p[0]);
thread.reply(p[0].id, p[1]);
thread.reply(p[0].id, p[2]);
data.thread = thread;

data.users = [
    {
        id: 'abc-1',
        username: "andy25",
    },
    {
        id: 'abc-2',
        username: "randomUser",
    }
];

export default data;
