/**
 * Provides a structure for storing key-value pairs.
 * Provides fast insert and lookup operations.
 * Provides fast pattern and prefix matching for keys.
 */

function TernaryTree() {
    /**
     * The head Node is stored as an entry point to the
     * data structure.  'm' is chosen as the head value because
     * it is a common initial near the center of the alphabet.
     */
    this.head = new Node();
    this.head.value = 'm';
}

/***********************
 * API-like methods
 ***********************/

TernaryTree.prototype.insert = function (key, value) {
    /**
     * Adds a new key-value pair to the tree.  
     * Key is treated as a string.
     * 
     * Returns 'true' on successful insert.
     * Returns 'false' if the key is already in the tree.
     * 
     * (Would it be better to throw an error if the key
     * is already in the tree?)
     */
    let nd = this._insertKey(key, 0, this.head);
    if (nd == undefined) return false;
    else {
        nd.data = value;
        return true;
    }
}

TernaryTree.prototype.insertKey = function(key) {
    /**
     * Adds a key to the tree.
     * 
     * Returns 'true' on successful insert.
     * Returns 'false' if the key is already in the tree. 
     */
    let nd = this._insertKey(key, 0, this.head);
    if (nd == undefined) return false;
    else return true;
}

TernaryTree.prototype.remove = function(key) {
    /**
     * Removes a key from the tree.
     * 
     * Returns the value associated with the key.
     * Returns 'undefined' if the key was not found.
     */
    let nd = this._getFinalNode(key, 0, this.head);
    if ((nd != undefined) && (nd.valid)) {
        let data = nd.data;
        nd.data = undefined;
        nd.valid = false;
        return data;
    }
    else return undefined;
}

TernaryTree.prototype.containsKey = function(key) {
    /**
     * Verifies whether the search tree contains this key.
     * 
     * Returns 'true' if the key is in the tree.
     * Returns 'false' if the key is not in the tree.
     */
    let nd = this._getFinalNode(key, 0, this.head);
    if (nd != undefined) return nd.valid;
    else return false;
}

TernaryTree.prototype.get = function (key) {
    /**
     * Finds the data associated with the given key.
     * 
     * Returns the data if the key exists in the tree.
     * Returns 'undefined' if the key is not in the tree.
     */
    let nd = this._getFinalNode(key, 0, this.head);
    if ((nd != undefined) && (nd.valid)) return nd.data;
    else return undefined;
}

TernaryTree.prototype.set = function (key, value) {
    /**
     * Sets the value associated with the given key if
     * the key exists in the tree.
     * 
     * Returns 'true' if the key exists in the tree.
     * Returns 'false' if the key does not exist in the tree.
     * 
     * (Would it be better to throw an error if the key doesn't exist?)
     */
    let nd = this._getFinalNode(key, 0, this.head);
    if ((nd != undefined) && (nd.valid)) {
        nd.data = value;
        return true;
    } else return false;
}

TernaryTree.prototype.matchPattern = function (pattern) {
    /**
     * Matches a pattern like "t..t".
     * Treats the '.' character as a wildcard.
     * 
     * Returns an array of keys matching the pattern:
     * e.g. ["test", "toot", "tart", "tent", etc.].
     */
    let keySet = [];
    this._matchPattern(pattern, 0, '', this.head, keySet);
    return keySet;
}

TernaryTree.prototype.matchPrefix = function (prefix) {
    /**
     * Matches a prefix like "te".
     *  
     * Returns an array of keys matching the prefix:
     * e.g. ["test", "tell", "tectonic", "telephone", etc.].
     */
    let nd = this._getFinalNode(prefix, 0, this.head);
    let keySet = [];
    if (nd == undefined) return keySet;
    if (nd.valid) keySet.push(prefix);
    if (nd.equal != undefined) this._getBranchWords(nd.equal, prefix, keySet);
    return keySet;
}

TernaryTree.prototype.keys = function () {
    /**
     * Returns a sorted array of all keys.
     */
    let keySet = [];
    this._getBranchWords(this.head, '', keySet);
    return keySet;
}
    
/***********************
 * Helper Methods
 ***********************/

TernaryTree.prototype._insertKey = function recurse (key, pos, nd) {
    /**
     * Adds a key to the search tree by finding a path through
     * existing Nodes or creating new Nodes as needed.
     * 
     * Returns the final Node for this key on successful insert.
     * Returns 'undefined' if the key is already in the tree.
     */
    let c = key.charAt(pos);
    if (c == nd.value) {
        if (pos == key.length - 1) {
            if (nd.valid == true) return undefined;
            else nd.valid = true;
            return nd;
        } else {
            if (nd.equal != undefined) return recurse(key, ++pos, nd.equal);
            else {
                nd.equal = new Node();
                nd.equal.value = key.charAt(++pos);
                return recurse(key, pos, nd.equal);
            }
        }
    } else if (c < nd.value) {
        if (nd.smaller != undefined) return recurse(key, pos, nd.smaller);
        else {
            nd.smaller = new Node();
            nd.smaller.value = key.charAt(pos);
            return recurse(key, pos, nd.smaller);
        }
    } else { 
        if (nd.bigger != undefined) return recurse(key, pos, nd.bigger);
        else {
            nd.bigger = new Node();
            nd.bigger.value = key.charAt(pos);
            return recurse(key, pos, nd.bigger);
        }
    }
}

TernaryTree.prototype._matchPattern = function recurse (pattern, pos, strBuild, nd, keySet) {
    /**
     * Matches a pattern by finding a path through the search tree Nodes.
     * Interprets the '.' character as a wildcard.  When a wildcard is encountered,
     * the search path splits, treating each of the Nodes at this depth for this branch 
     * as a match, and continues, in lexical order, down each respective sub-branch.
     * Fills the 'keySet' array with keys matching the pattern.
     * 
     * Returns 'void'.
     */
    let c = pattern.charAt(pos);
    if (c == '.') {
        if (nd.smaller != undefined) recurse(pattern, pos, strBuild, nd.smaller, keySet);
        let oldStr = strBuild;
        strBuild += nd.value;
        if ((pos == pattern.length - 1) && (nd.valid)) keySet.push(strBuild);
        else if (nd.equal != undefined) recurse(pattern, pos + 1, strBuild, nd.equal, keySet);
        if (nd.bigger != undefined) recurse(pattern, pos, oldStr, nd.bigger, keySet);
    } 
    else if (c == nd.value) {
        strBuild += c;
        if ((pos == pattern.length - 1) && (nd.valid)) keySet.push(strBuild);
        if ((pos < pattern.length - 1) && (nd.equal != undefined)) {
            recurse(pattern, ++pos, strBuild, nd.equal, keySet);
        }
    } else if ((c < nd.value) && (nd.smaller != undefined)) {
        recurse(pattern, pos, strBuild, nd.smaller, keySet);
    } else if (nd.bigger != undefined) {
        recurse(pattern, pos, strBuild, nd.bigger, keySet);
    }
}

TernaryTree.prototype._getFinalNode = function recurse (key, pos, nd) {
    /**
     * Finds the Node corresponding to the last character in a key
     * by finding a path through the search tree Nodes.
     * 
     * Returns the final Node if it exists in the tree.
     * Returns 'undefined' if no such Node exists.
     */
    let c = key.charAt(pos);
    if (c == nd.value) {
        if (pos == key.length - 1) return nd;
        else if (nd.equal != undefined) return recurse(key, ++pos, nd.equal);
        else return undefined;
    } else if (c < nd.value) {
        if (nd.smaller != undefined) return recurse(key, pos, nd.smaller);
        else return undefined;
    } else if (nd.bigger != undefined) return recurse(key, pos, nd.bigger);
    else return undefined;
}

TernaryTree.prototype._getBranchWords = function recurse (nd, strBuild, keySet) {
    /**
     * Traverses the branch headed by this Node in lexical order.
     * Fills the 'keySet' array with all valid keys in this branch.
     * 
     * Returns 'void'.
     */
    if (nd.smaller != undefined) recurse(nd.smaller, strBuild, keySet);
    let oldStr = strBuild;
    strBuild += nd.value;
    if (nd.valid) keySet.push(strBuild);
    if (nd.equal != undefined) recurse(nd.equal, strBuild, keySet);
    if (nd.bigger != undefined) recurse(nd.bigger, oldStr, keySet);
}

/**
 * A simple object from which to build a ternary search tree.
 * Each Node represents a character in a valid string.
 */
function Node() {
    // The character that this Node represents.
    this.value = undefined,
    
    // A flag indicating whether this Node is the last
    // character in a valid string.
    this.valid = false,

    // The data to be associated with a key.
    // Data is stored in the final Node for the key. 
    this.data = undefined;
    
    // Child Nodes to create a ternary structure.
    this.smaller = undefined,
    this.bigger = undefined,
    this.equal = undefined
};