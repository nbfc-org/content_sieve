import SymbolTree from 'symbol-tree';
import uuid62 from 'uuid62';

const data = {};

const p = [
    {
        id: uuid62.v4(),
        content: {
            body: "First Post - Hello world",
        },
        createdAt: '2020-09-01T21:11:07.000Z',
        userId: 'abc-1',
    },
    {
        id: uuid62.v4(),
        content: {
            body: "Second Post - Hello again",
        },
        createdAt: '2020-09-01T21:11:07.000Z',
        userId: 'abc-1',
    },
    {
        id: uuid62.v4(),
        content: {
            title: "Random Post",
            url: "https://google.com",
        },
        createdAt: '2020-09-01T21:11:07.000Z',
        userId: 'abc-1',
    }
];

class Thread {
    constructor(newPost) {
        this.tree = new SymbolTree();
        this.root = {};
        this.tree.initialize(this.root);
        this.lookup = {}
        this.lookup[undefined] = this.root;
        this.reply(undefined, newPost);
    }
    insert(newPost) {
        const { id } = newPost;
        this.lookup[id] = newPost;
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
