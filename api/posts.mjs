import SymbolTree from 'symbol-tree';
import uuid62 from 'uuid62';
import base36 from 'base36';

const p = [
    {
        id: uuid62.v4(),
        content: {
            body: "First Post - Hello world",
        },
        createdAt: Date.now(),
        userId: 'abc-1',
    },
    {
        id: uuid62.v4(),
        content: {
            body: "Second Post - Hello again",
        },
        createdAt: Date.now(),
        userId: 'abc-1',
    },
    {
        id: uuid62.v4(),
        content: {
            title: "Random Post",
            url: "https://google.com",
        },
        createdAt: Date.now(),
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
    }
    get(id) {
        return this.lookup[id];
    }
    childrenCount(id) {
        return this.tree.childrenCount(this.get(id));
    }
    childIds(id) {
        return this.tree.childrenToArray(this.lookup[id]).map(o => o.id);
    }
    reply(parentId, newPost, index='00') {
        const { id } = newPost;
        if (!this.lookup.hasOwnProperty(id)) {
            this.lookup[id] = newPost;
            const parent = this.lookup[parentId];
            this.tree.appendChild(parent, newPost);
        }
        const pathmap = {};
        pathmap[id] = `${index}:00`;
        return this._objectWithContext(newPost, pathmap);
    }
    _objectWithContext(o, pathmap) {
        const p = this.tree.parent(o);
        if (p) {
            return Object.assign({}, o, { parent: p.id, index: pathmap[o.id] });
        }
        return o;
    }
    _dfs(o, paths, depth) {
        paths[o.id] = depth.map(i => base36.base36encode(i).padStart(2, "0")).join(':');
        let i = 0;
        for (const node of this.tree.childrenIterator(o)) {
            this._dfs(node, paths, [...depth, i]);
            i = i + 1;
        }
    }
    toArray(id) {
        const obj = this.lookup[id];
        const pathmap = {};
        this._dfs(obj, pathmap, []);
        // console.log(pathmap);
        for (const node of this.tree.treeIterator(obj)) {
            // console.log(node);
        }
        return this.tree
            .treeToArray(obj)
            .map(o => this._objectWithContext(o, pathmap));
    }
}

const testData = function() {
    const thread = new Thread();
    thread.reply(undefined, p[0]);
    for (const i of [...Array(20).keys()]) {
        thread.reply(p[0].id, Object.assign({}, p[1], {id: uuid62.v4()}));
        thread.reply(p[0].id, Object.assign({}, p[2], {id: uuid62.v4()}));
    }
    const data = {};

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
    return data;
};

export { testData, Thread };
