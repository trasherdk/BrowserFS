var node_fs_stats_1 = require('../core/node_fs_stats');
var path = require('path');
var FileIndex = (function () {
    function FileIndex() {
        this._index = {};
        this.addPath('/', new DirInode());
    }
    FileIndex.prototype._split_path = function (p) {
        var dirpath = path.dirname(p);
        var itemname = p.substr(dirpath.length + (dirpath === "/" ? 0 : 1));
        return [dirpath, itemname];
    };
    FileIndex.prototype.fileIterator = function (cb) {
        for (var path in this._index) {
            var dir = this._index[path];
            var files = dir.getListing();
            for (var i = 0; i < files.length; i++) {
                var item = dir.getItem(files[i]);
                if (isFileInode(item)) {
                    cb(item.getData());
                }
            }
        }
    };
    FileIndex.prototype.addPath = function (path, inode) {
        if (inode == null) {
            throw new Error('Inode must be specified');
        }
        if (path[0] !== '/') {
            throw new Error('Path must be absolute, got: ' + path);
        }
        if (this._index.hasOwnProperty(path)) {
            return this._index[path] === inode;
        }
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined && path !== '/') {
            parent = new DirInode();
            if (!this.addPath(dirpath, parent)) {
                return false;
            }
        }
        if (path !== '/') {
            if (!parent.addItem(itemname, inode)) {
                return false;
            }
        }
        if (isDirInode(inode)) {
            this._index[path] = inode;
        }
        return true;
    };
    FileIndex.prototype.removePath = function (path) {
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined) {
            return null;
        }
        var inode = parent.remItem(itemname);
        if (inode === null) {
            return null;
        }
        if (isDirInode(inode)) {
            var children = inode.getListing();
            for (var i = 0; i < children.length; i++) {
                this.removePath(path + '/' + children[i]);
            }
            if (path !== '/') {
                delete this._index[path];
            }
        }
        return inode;
    };
    FileIndex.prototype.ls = function (path) {
        var item = this._index[path];
        if (item === undefined) {
            return null;
        }
        return item.getListing();
    };
    FileIndex.prototype.getInode = function (path) {
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined) {
            return null;
        }
        if (dirpath === path) {
            return parent;
        }
        return parent.getItem(itemname);
    };
    FileIndex.fromListing = function (listing) {
        var idx = new FileIndex();
        var rootInode = new DirInode();
        idx._index['/'] = rootInode;
        var queue = [['', listing, rootInode]];
        while (queue.length > 0) {
            var inode;
            var next = queue.pop();
            var pwd = next[0];
            var tree = next[1];
            var parent = next[2];
            for (var node in tree) {
                var children = tree[node];
                var name = "" + pwd + "/" + node;
                if (children != null) {
                    idx._index[name] = inode = new DirInode();
                    queue.push([name, children, inode]);
                }
                else {
                    inode = new FileInode(new node_fs_stats_1.Stats(node_fs_stats_1.FileType.FILE, -1, 0x16D));
                }
                if (parent != null) {
                    parent._ls[node] = inode;
                }
            }
        }
        return idx;
    };
    return FileIndex;
})();
exports.FileIndex = FileIndex;
var FileInode = (function () {
    function FileInode(data) {
        this.data = data;
    }
    FileInode.prototype.isFile = function () { return true; };
    FileInode.prototype.isDir = function () { return false; };
    FileInode.prototype.getData = function () { return this.data; };
    FileInode.prototype.setData = function (data) { this.data = data; };
    return FileInode;
})();
exports.FileInode = FileInode;
var DirInode = (function () {
    function DirInode() {
        this._ls = {};
    }
    DirInode.prototype.isFile = function () {
        return false;
    };
    DirInode.prototype.isDir = function () {
        return true;
    };
    DirInode.prototype.getStats = function () {
        return new node_fs_stats_1.Stats(node_fs_stats_1.FileType.DIRECTORY, 4096, 0x16D);
    };
    DirInode.prototype.getListing = function () {
        return Object.keys(this._ls);
    };
    DirInode.prototype.getItem = function (p) {
        var _ref;
        return (_ref = this._ls[p]) != null ? _ref : null;
    };
    DirInode.prototype.addItem = function (p, inode) {
        if (p in this._ls) {
            return false;
        }
        this._ls[p] = inode;
        return true;
    };
    DirInode.prototype.remItem = function (p) {
        var item = this._ls[p];
        if (item === undefined) {
            return null;
        }
        delete this._ls[p];
        return item;
    };
    return DirInode;
})();
exports.DirInode = DirInode;
function isFileInode(inode) {
    return inode && inode.isFile();
}
exports.isFileInode = isFileInode;
function isDirInode(inode) {
    return inode && inode.isDir();
}
exports.isDirInode = isDirInode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9pbmRleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZW5lcmljL2ZpbGVfaW5kZXgudHMiXSwibmFtZXMiOlsiRmlsZUluZGV4IiwiRmlsZUluZGV4LmNvbnN0cnVjdG9yIiwiRmlsZUluZGV4Ll9zcGxpdF9wYXRoIiwiRmlsZUluZGV4LmZpbGVJdGVyYXRvciIsIkZpbGVJbmRleC5hZGRQYXRoIiwiRmlsZUluZGV4LnJlbW92ZVBhdGgiLCJGaWxlSW5kZXgubHMiLCJGaWxlSW5kZXguZ2V0SW5vZGUiLCJGaWxlSW5kZXguZnJvbUxpc3RpbmciLCJGaWxlSW5vZGUiLCJGaWxlSW5vZGUuY29uc3RydWN0b3IiLCJGaWxlSW5vZGUuaXNGaWxlIiwiRmlsZUlub2RlLmlzRGlyIiwiRmlsZUlub2RlLmdldERhdGEiLCJGaWxlSW5vZGUuc2V0RGF0YSIsIkRpcklub2RlIiwiRGlySW5vZGUuY29uc3RydWN0b3IiLCJEaXJJbm9kZS5pc0ZpbGUiLCJEaXJJbm9kZS5pc0RpciIsIkRpcklub2RlLmdldFN0YXRzIiwiRGlySW5vZGUuZ2V0TGlzdGluZyIsIkRpcklub2RlLmdldEl0ZW0iLCJEaXJJbm9kZS5hZGRJdGVtIiwiRGlySW5vZGUucmVtSXRlbSIsImlzRmlsZUlub2RlIiwiaXNEaXJJbm9kZSJdLCJtYXBwaW5ncyI6IkFBQUEsOEJBQThCLHVCQUF1QixDQUFDLENBQUE7QUFDdEQsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFTOUI7SUFPRUE7UUFHRUMsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUtPRCwrQkFBV0EsR0FBbkJBLFVBQW9CQSxDQUFTQTtRQUMzQkUsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0Es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QUFRQSxDQUFDQSxDQUFDQTtRQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtZQUNsQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7Z0JBQ3pDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1Q0EsQ0FBQ0E7WUFHREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pCQSxPQUFPQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUMzQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFPTUwsc0JBQUVBLEdBQVRBLFVBQVVBLElBQVlBO1FBQ3BCTSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQzNCQSxDQUFDQTtJQVFNTiw0QkFBUUEsR0FBZkEsVUFBZ0JBLElBQVlBO1FBQzFCTyxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2Q0EsSUFBSUEsT0FBT0EsR0FBR0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLElBQUlBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRTVCQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNsQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDbENBLENBQUNBO0lBT2FQLHFCQUFXQSxHQUF6QkEsVUFBMEJBLE9BQU9BO1FBQy9CUSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUUxQkEsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDL0JBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBO1FBQzVCQSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxPQUFPQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2Q0EsT0FBT0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDeEJBLElBQUlBLEtBQUtBLENBQUNBO1lBQ1ZBLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ3ZCQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUMxQkEsSUFBSUEsSUFBSUEsR0FBR0EsRUFBRUEsR0FBR0EsR0FBR0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDckJBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEtBQUtBLEdBQUdBLElBQUlBLFFBQVFBLEVBQUVBLENBQUNBO29CQUMxQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBRU5BLEtBQUtBLEdBQUdBLElBQUlBLFNBQVNBLENBQVFBLElBQUlBLHFCQUFLQSxDQUFDQSx3QkFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsSUFB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QUFDQTtBQUFEQSxDQUFDQSxBQXBFRCxJQW9FQztBQXBFWSxnQkFBUSxXQW9FcEIsQ0FBQTtBQUVELHFCQUErQixLQUFZO0lBQ3pDUyxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtBQUNqQ0EsQ0FBQ0E7QUFGZSxtQkFBVyxjQUUxQixDQUFBO0FBRUQsb0JBQTJCLEtBQVk7SUFDckNDLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO0FBQ2hDQSxDQUFDQTtBQUZlLGtCQUFVLGFBRXpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1N0YXRzLCBGaWxlVHlwZX0gZnJvbSAnLi4vY29yZS9ub2RlX2ZzX3N0YXRzJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vKipcbiAqIEEgc2ltcGxlIGNsYXNzIGZvciBzdG9yaW5nIGEgZmlsZXN5c3RlbSBpbmRleC4gQXNzdW1lcyB0aGF0IGFsbCBwYXRocyBwYXNzZWRcbiAqIHRvIGl0IGFyZSAqYWJzb2x1dGUqIHBhdGhzLlxuICpcbiAqIENhbiBiZSB1c2VkIGFzIGEgcGFydGlhbCBvciBhIGZ1bGwgaW5kZXgsIGFsdGhvdWdoIGNhcmUgbXVzdCBiZSB0YWtlbiBpZiB1c2VkXG4gKiBmb3IgdGhlIGZvcm1lciBwdXJwb3NlLCBlc3BlY2lhbGx5IHdoZW4gZGlyZWN0b3JpZXMgYXJlIGNvbmNlcm5lZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVJbmRleCB7XG4gIC8vIE1hcHMgZGlyZWN0b3J5IHBhdGhzIHRvIGRpcmVjdG9yeSBpbm9kZXMsIHdoaWNoIGNvbnRhaW4gZmlsZXMuXG4gIHByaXZhdGUgX2luZGV4OiB7W3BhdGg6IHN0cmluZ106IERpcklub2RlfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEZpbGVJbmRleC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIF9pbmRleCBpcyBhIHNpbmdsZS1sZXZlbCBrZXksdmFsdWUgc3RvcmUgdGhhdCBtYXBzICpkaXJlY3RvcnkqIHBhdGhzIHRvXG4gICAgLy8gRGlySW5vZGVzLiBGaWxlIGluZm9ybWF0aW9uIGlzIG9ubHkgY29udGFpbmVkIGluIERpcklub2RlcyB0aGVtc2VsdmVzLlxuICAgIHRoaXMuX2luZGV4ID0ge307XG4gICAgLy8gQ3JlYXRlIHRoZSByb290IGRpcmVjdG9yeS5cbiAgICB0aGlzLmFkZFBhdGgoJy8nLCBuZXcgRGlySW5vZGUoKSk7XG4gIH1cblxuICAvKipcbiAgICogU3BsaXQgaW50byBhIChkaXJlY3RvcnkgcGF0aCwgaXRlbSBuYW1lKSBwYWlyXG4gICAqL1xuICBwcml2YXRlIF9zcGxpdF9wYXRoKHA6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICB2YXIgZGlycGF0aCA9IHBhdGguZGlybmFtZShwKTtcbiAgICB2YXIgaXRlbW5hbWUgPSBwLnN1YnN0cihkaXJwYXRoLmxlbmd0aCArIChkaXJwYXRoID09PSBcIi9cIiA/IDAgOiAxKSk7XG4gICAgcmV0dXJuIFtkaXJwYXRoLCBpdGVtbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgZ2l2ZW4gZnVuY3Rpb24gb3ZlciBhbGwgZmlsZXMgaW4gdGhlIGluZGV4LlxuICAgKi9cbiAgcHVibGljIGZpbGVJdGVyYXRvcjxUPihjYjogKGZpbGU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBwYXRoIGluIHRoaXMuX2luZGV4KSB7XG4gICAgICB2YXIgZGlyID0gdGhpcy5faW5kZXhbcGF0aF07XG4gICAgICB2YXIgZmlsZXMgPSBkaXIuZ2V0TGlzdGluZygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaXRlbSA9IGRpci5nZXRJdGVtKGZpbGVzW2ldKTtcbiAgICAgICAgaWYgKGlzRmlsZUlub2RlPFQ+KGl0ZW0pKSB7XG4gICAgICAgICAgY2IoaXRlbS5nZXREYXRhKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGdpdmVuIGFic29sdXRlIHBhdGggdG8gdGhlIGluZGV4IGlmIGl0IGlzIG5vdCBhbHJlYWR5IGluIHRoZSBpbmRleC5cbiAgICogQ3JlYXRlcyBhbnkgbmVlZGVkIHBhcmVudCBkaXJlY3Rvcmllcy5cbiAgICogQHBhcmFtIFtTdHJpbmddIHBhdGggVGhlIHBhdGggdG8gYWRkIHRvIHRoZSBpbmRleC5cbiAgICogQHBhcmFtIFtCcm93c2VyRlMuRmlsZUlub2RlIHwgQnJvd3NlckZTLkRpcklub2RlXSBpbm9kZSBUaGUgaW5vZGUgZm9yIHRoZVxuICAgKiAgIHBhdGggdG8gYWRkLlxuICAgKiBAcmV0dXJuIFtCb29sZWFuXSAnVHJ1ZScgaWYgaXQgd2FzIGFkZGVkIG9yIGFscmVhZHkgZXhpc3RzLCAnZmFsc2UnIGlmIHRoZXJlXG4gICAqICAgd2FzIGFuIGlzc3VlIGFkZGluZyBpdCAoZS5nLiBpdGVtIGluIHBhdGggaXMgYSBmaWxlLCBpdGVtIGV4aXN0cyBidXQgaXNcbiAgICogICBkaWZmZXJlbnQpLlxuICAgKiBAdG9kbyBJZiBhZGRpbmcgZmFpbHMgYW5kIGltcGxpY2l0bHkgY3JlYXRlcyBkaXJlY3Rvcmllcywgd2UgZG8gbm90IGNsZWFuIHVwXG4gICAqICAgdGhlIG5ldyBlbXB0eSBkaXJlY3Rvcmllcy5cbiAgICovXG4gIHB1YmxpYyBhZGRQYXRoKHBhdGg6IHN0cmluZywgaW5vZGU6IElub2RlKTogYm9vbGVhbiB7XG4gICAgaWYgKGlub2RlID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5vZGUgbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgICB9XG4gICAgaWYgKHBhdGhbMF0gIT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIG11c3QgYmUgYWJzb2x1dGUsIGdvdDogJyArIHBhdGgpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGl0IGFscmVhZHkgZXhpc3RzLlxuICAgIGlmICh0aGlzLl9pbmRleC5oYXNPd25Qcm9wZXJ0eShwYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2luZGV4W3BhdGhdID09PSBpbm9kZTtcbiAgICB9XG5cbiAgICB2YXIgc3BsaXRQYXRoID0gdGhpcy5fc3BsaXRfcGF0aChwYXRoKTtcbiAgICB2YXIgZGlycGF0aCA9IHNwbGl0UGF0aFswXTtcbiAgICB2YXIgaXRlbW5hbWUgPSBzcGxpdFBhdGhbMV07XG4gICAgLy8gVHJ5IHRvIGFkZCB0byBpdHMgcGFyZW50IGRpcmVjdG9yeSBmaXJzdC5cbiAgICB2YXIgcGFyZW50ID0gdGhpcy5faW5kZXhbZGlycGF0aF07XG4gICAgaWYgKHBhcmVudCA9PT0gdW5kZWZpbmVkICYmIHBhdGggIT09ICcvJykge1xuICAgICAgLy8gQ3JlYXRlIHBhcmVudC5cbiAgICAgIHBhcmVudCA9IG5ldyBEaXJJbm9kZSgpO1xuICAgICAgaWYgKCF0aGlzLmFkZFBhdGgoZGlycGF0aCwgcGFyZW50KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFkZCBteXNlbGYgdG8gbXkgcGFyZW50LlxuICAgIGlmIChwYXRoICE9PSAnLycpIHtcbiAgICAgIGlmICghcGFyZW50LmFkZEl0ZW0oaXRlbW5hbWUsIGlub2RlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIElmIEknbSBhIGRpcmVjdG9yeSwgYWRkIG15c2VsZiB0byB0aGUgaW5kZXguXG4gICAgaWYgKGlzRGlySW5vZGUoaW5vZGUpKSB7XG4gICAgICB0aGlzLl9pbmRleFtwYXRoXSA9IGlub2RlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBnaXZlbiBwYXRoLiBDYW4gYmUgYSBmaWxlIG9yIGEgZGlyZWN0b3J5LlxuICAgKiBAcmV0dXJuIFtCcm93c2VyRlMuRmlsZUlub2RlIHwgQnJvd3NlckZTLkRpcklub2RlIHwgbnVsbF0gVGhlIHJlbW92ZWQgaXRlbSxcbiAgICogICBvciBudWxsIGlmIGl0IGRpZCBub3QgZXhpc3QuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlUGF0aChwYXRoOiBzdHJpbmcpOiBJbm9kZSB7XG4gICAgdmFyIHNwbGl0UGF0aCA9IHRoaXMuX3NwbGl0X3BhdGgocGF0aCk7XG4gICAgdmFyIGRpcnBhdGggPSBzcGxpdFBhdGhbMF07XG4gICAgdmFyIGl0ZW1uYW1lID0gc3BsaXRQYXRoWzFdO1xuXG4gICAgLy8gVHJ5IHRvIHJlbW92ZSBpdCBmcm9tIGl0cyBwYXJlbnQgZGlyZWN0b3J5IGZpcnN0LlxuICAgIHZhciBwYXJlbnQgPSB0aGlzLl9pbmRleFtkaXJwYXRoXTtcbiAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBSZW1vdmUgbXlzZWxmIGZyb20gbXkgcGFyZW50LlxuICAgIHZhciBpbm9kZSA9IHBhcmVudC5yZW1JdGVtKGl0ZW1uYW1lKTtcbiAgICBpZiAoaW5vZGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBJZiBJJ20gYSBkaXJlY3RvcnksIHJlbW92ZSBteXNlbGYgZnJvbSB0aGUgaW5kZXgsIGFuZCByZW1vdmUgbXkgY2hpbGRyZW4uXG4gICAgaWYgKGlzRGlySW5vZGUoaW5vZGUpKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBpbm9kZS5nZXRMaXN0aW5nKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlUGF0aChwYXRoICsgJy8nICsgY2hpbGRyZW5baV0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgdGhlIGRpcmVjdG9yeSBmcm9tIHRoZSBpbmRleCwgdW5sZXNzIGl0J3MgdGhlIHJvb3QuXG4gICAgICBpZiAocGF0aCAhPT0gJy8nKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9pbmRleFtwYXRoXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlub2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgZGlyZWN0b3J5IGxpc3Rpbmcgb2YgdGhlIGdpdmVuIHBhdGguXG4gICAqIEByZXR1cm4gW1N0cmluZ1tdXSBBbiBhcnJheSBvZiBmaWxlcyBpbiB0aGUgZ2l2ZW4gcGF0aCwgb3IgJ251bGwnIGlmIGl0IGRvZXNcbiAgICogICBub3QgZXhpc3QuXG4gICAqL1xuICBwdWJsaWMgbHMocGF0aDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIHZhciBpdGVtID0gdGhpcy5faW5kZXhbcGF0aF07XG4gICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBpdGVtLmdldExpc3RpbmcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbm9kZSBvZiB0aGUgZ2l2ZW4gaXRlbS5cbiAgICogQHBhcmFtIFtTdHJpbmddIHBhdGhcbiAgICogQHJldHVybiBbQnJvd3NlckZTLkZpbGVJbm9kZSB8IEJyb3dzZXJGUy5EaXJJbm9kZSB8IG51bGxdIFJldHVybnMgbnVsbCBpZlxuICAgKiAgIHRoZSBpdGVtIGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgcHVibGljIGdldElub2RlKHBhdGg6IHN0cmluZyk6IElub2RlIHtcbiAgICB2YXIgc3BsaXRQYXRoID0gdGhpcy5fc3BsaXRfcGF0aChwYXRoKTtcbiAgICB2YXIgZGlycGF0aCA9IHNwbGl0UGF0aFswXTtcbiAgICB2YXIgaXRlbW5hbWUgPSBzcGxpdFBhdGhbMV07XG4gICAgLy8gUmV0cmlldmUgZnJvbSBpdHMgcGFyZW50IGRpcmVjdG9yeS5cbiAgICB2YXIgcGFyZW50ID0gdGhpcy5faW5kZXhbZGlycGF0aF07XG4gICAgaWYgKHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gUm9vdCBjYXNlXG4gICAgaWYgKGRpcnBhdGggPT09IHBhdGgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnQuZ2V0SXRlbShpdGVtbmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCBmb3IgY29uc3RydWN0aW5nIGluZGljZXMgZnJvbSBhIEpTT04gbGlzdGluZy5cbiAgICogQHBhcmFtIFtPYmplY3RdIGxpc3RpbmcgRGlyZWN0b3J5IGxpc3RpbmcgZ2VuZXJhdGVkIGJ5IHRvb2xzL1hIUkluZGV4ZXIuY29mZmVlXG4gICAqIEByZXR1cm4gW0Jyb3dzZXJGUy5GaWxlSW5kZXhdIEEgbmV3IEZpbGVJbmRleCBvYmplY3QuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21MaXN0aW5nKGxpc3RpbmcpOiBGaWxlSW5kZXgge1xuICAgIHZhciBpZHggPSBuZXcgRmlsZUluZGV4KCk7XG4gICAgLy8gQWRkIGEgcm9vdCBEaXJOb2RlLlxuICAgIHZhciByb290SW5vZGUgPSBuZXcgRGlySW5vZGUoKTtcbiAgICBpZHguX2luZGV4WycvJ10gPSByb290SW5vZGU7XG4gICAgdmFyIHF1ZXVlID0gW1snJywgbGlzdGluZywgcm9vdElub2RlXV07XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBpbm9kZTtcbiAgICAgIHZhciBuZXh0ID0gcXVldWUucG9wKCk7XG4gICAgICB2YXIgcHdkID0gbmV4dFswXTtcbiAgICAgIHZhciB0cmVlID0gbmV4dFsxXTtcbiAgICAgIHZhciBwYXJlbnQgPSBuZXh0WzJdO1xuICAgICAgZm9yICh2YXIgbm9kZSBpbiB0cmVlKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRyZWVbbm9kZV07XG4gICAgICAgIHZhciBuYW1lID0gXCJcIiArIHB3ZCArIFwiL1wiICsgbm9kZTtcbiAgICAgICAgaWYgKGNoaWxkcmVuICE9IG51bGwpIHtcbiAgICAgICAgICBpZHguX2luZGV4W25hbWVdID0gaW5vZGUgPSBuZXcgRGlySW5vZGUoKTtcbiAgICAgICAgICBxdWV1ZS5wdXNoKFtuYW1lLCBjaGlsZHJlbiwgaW5vZGVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGlzIGlub2RlIGRvZXNuJ3QgaGF2ZSBjb3JyZWN0IHNpemUgaW5mb3JtYXRpb24sIG5vdGVkIHdpdGggLTEuXG4gICAgICAgICAgaW5vZGUgPSBuZXcgRmlsZUlub2RlPFN0YXRzPihuZXcgU3RhdHMoRmlsZVR5cGUuRklMRSwgLTEsIDB4MTZEKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgcGFyZW50Ll9sc1tub2RlXSA9IGlub2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpZHg7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmljIGludGVyZmFjZSBmb3IgZmlsZS9kaXJlY3RvcnkgaW5vZGVzLlxuICogTm90ZSB0aGF0IFN0YXRzIG9iamVjdHMgYXJlIHdoYXQgd2UgdXNlIGZvciBmaWxlIGlub2Rlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbm9kZSB7XG4gIC8vIElzIHRoaXMgYW4gaW5vZGUgZm9yIGEgZmlsZT9cbiAgaXNGaWxlKCk6IGJvb2xlYW47XG4gIC8vIElzIHRoaXMgYW4gaW5vZGUgZm9yIGEgZGlyZWN0b3J5P1xuICBpc0RpcigpOiBib29sZWFuO1xufVxuXG4vKipcbiAqIElub2RlIGZvciBhIGZpbGUuIFN0b3JlcyBhbiBhcmJpdHJhcnkgKGZpbGVzeXN0ZW0tc3BlY2lmaWMpIGRhdGEgcGF5bG9hZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVJbm9kZTxUPiBpbXBsZW1lbnRzIElub2RlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkYXRhOiBUKSB7IH1cbiAgcHVibGljIGlzRmlsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cbiAgcHVibGljIGlzRGlyKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgcHVibGljIGdldERhdGEoKTogVCB7IHJldHVybiB0aGlzLmRhdGE7IH1cbiAgcHVibGljIHNldERhdGEoZGF0YTogVCk6IHZvaWQgeyB0aGlzLmRhdGEgPSBkYXRhOyB9XG59XG5cbi8qKlxuICogSW5vZGUgZm9yIGEgZGlyZWN0b3J5LiBDdXJyZW50bHkgb25seSBjb250YWlucyB0aGUgZGlyZWN0b3J5IGxpc3RpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXJJbm9kZSBpbXBsZW1lbnRzIElub2RlIHtcbiAgcHJpdmF0ZSBfbHM6IHtbcGF0aDogc3RyaW5nXTogSW5vZGV9ID0ge307XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGFuIGlub2RlIGZvciBhIGRpcmVjdG9yeS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge31cbiAgcHVibGljIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcHVibGljIGlzRGlyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIFN0YXRzIG9iamVjdCBmb3IgdGhpcyBpbm9kZS5cbiAgICogQHRvZG8gU2hvdWxkIHByb2JhYmx5IHJlbW92ZSB0aGlzIGF0IHNvbWUgcG9pbnQuIFRoaXMgaXNuJ3QgdGhlXG4gICAqICAgICAgIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBGaWxlSW5kZXguXG4gICAqIEByZXR1cm4gW0Jyb3dzZXJGUy5ub2RlLmZzLlN0YXRzXVxuICAgKi9cbiAgcHVibGljIGdldFN0YXRzKCk6IFN0YXRzIHtcbiAgICByZXR1cm4gbmV3IFN0YXRzKEZpbGVUeXBlLkRJUkVDVE9SWSwgNDA5NiwgMHgxNkQpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaXJlY3RvcnkgbGlzdGluZyBmb3IgdGhpcyBkaXJlY3RvcnkuIFBhdGhzIGluIHRoZSBkaXJlY3RvcnkgYXJlXG4gICAqIHJlbGF0aXZlIHRvIHRoZSBkaXJlY3RvcnkncyBwYXRoLlxuICAgKiBAcmV0dXJuIFtTdHJpbmdbXV0gVGhlIGRpcmVjdG9yeSBsaXN0aW5nIGZvciB0aGlzIGRpcmVjdG9yeS5cbiAgICovXG4gIHB1YmxpYyBnZXRMaXN0aW5nKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fbHMpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbm9kZSBmb3IgdGhlIGluZGljYXRlZCBpdGVtLCBvciBudWxsIGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgKiBAcGFyYW0gW1N0cmluZ10gcCBOYW1lIG9mIGl0ZW0gaW4gdGhpcyBkaXJlY3RvcnkuXG4gICAqIEByZXR1cm4gW0Jyb3dzZXJGUy5GaWxlSW5vZGUgfCBCcm93c2VyRlMuRGlySW5vZGUgfCBudWxsXVxuICAgKi9cbiAgcHVibGljIGdldEl0ZW0ocDogc3RyaW5nKTogSW5vZGUge1xuICAgIHZhciBfcmVmO1xuICAgIHJldHVybiAoX3JlZiA9IHRoaXMuX2xzW3BdKSAhPSBudWxsID8gX3JlZiA6IG51bGw7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCB0aGUgZ2l2ZW4gaXRlbSB0byB0aGUgZGlyZWN0b3J5IGxpc3RpbmcuIE5vdGUgdGhhdCB0aGUgZ2l2ZW4gaW5vZGUgaXNcbiAgICogbm90IGNvcGllZCwgYW5kIHdpbGwgYmUgbXV0YXRlZCBieSB0aGUgRGlySW5vZGUgaWYgaXQgaXMgYSBEaXJJbm9kZS5cbiAgICogQHBhcmFtIFtTdHJpbmddIHAgSXRlbSBuYW1lIHRvIGFkZCB0byB0aGUgZGlyZWN0b3J5IGxpc3RpbmcuXG4gICAqIEBwYXJhbSBbQnJvd3NlckZTLkZpbGVJbm9kZSB8IEJyb3dzZXJGUy5EaXJJbm9kZV0gaW5vZGUgVGhlIGlub2RlIGZvciB0aGVcbiAgICogICBpdGVtIHRvIGFkZCB0byB0aGUgZGlyZWN0b3J5IGlub2RlLlxuICAgKiBAcmV0dXJuIFtCb29sZWFuXSBUcnVlIGlmIGl0IHdhcyBhZGRlZCwgZmFsc2UgaWYgaXQgYWxyZWFkeSBleGlzdGVkLlxuICAgKi9cbiAgcHVibGljIGFkZEl0ZW0ocDogc3RyaW5nLCBpbm9kZTogSW5vZGUpOiBib29sZWFuIHtcbiAgICBpZiAocCBpbiB0aGlzLl9scykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLl9sc1twXSA9IGlub2RlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBnaXZlbiBpdGVtIGZyb20gdGhlIGRpcmVjdG9yeSBsaXN0aW5nLlxuICAgKiBAcGFyYW0gW1N0cmluZ10gcCBOYW1lIG9mIGl0ZW0gdG8gcmVtb3ZlIGZyb20gdGhlIGRpcmVjdG9yeSBsaXN0aW5nLlxuICAgKiBAcmV0dXJuIFtCcm93c2VyRlMuRmlsZUlub2RlIHwgQnJvd3NlckZTLkRpcklub2RlIHwgbnVsbF0gUmV0dXJucyB0aGUgaXRlbVxuICAgKiAgIHJlbW92ZWQsIG9yIG51bGwgaWYgdGhlIGl0ZW0gZGlkIG5vdCBleGlzdC5cbiAgICovXG4gIHB1YmxpYyByZW1JdGVtKHA6IHN0cmluZyk6IElub2RlIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMuX2xzW3BdO1xuICAgIGlmIChpdGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZWxldGUgdGhpcy5fbHNbcF07XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmlsZUlub2RlPFQ+KGlub2RlOiBJbm9kZSk6IGlub2RlIGlzIEZpbGVJbm9kZTxUPiB7XG4gIHJldHVybiBpbm9kZSAmJiBpbm9kZS5pc0ZpbGUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGlySW5vZGUoaW5vZGU6IElub2RlKTogaW5vZGUgaXMgRGlySW5vZGUge1xuICByZXR1cm4gaW5vZGUgJiYgaW5vZGUuaXNEaXIoKTtcbn1cbiJdfQ==