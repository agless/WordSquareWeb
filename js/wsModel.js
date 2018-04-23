var model = {
    
    /*********************
     * Member variables
     *********************/

    searchTree: undefined,
    squareWords: Array(6).fill(undefined),
    solutionList: [],

    /********************
     * API-like Methods
     ********************/
    
    addSquareWord: function(word, pos) {
        /**
         * Adds a new word to the data model at the specified index, 
         * but only if it fits.
         * 
         * Returns 'true' if the word can be added.
         * Returns 'false' if the word cannot be added.
         */
        // Check to make sure word is not in an impossible position
        if (word.length <= pos) return false;
        for (let i = 0; i < word.length; i++) {
            if (this.squareWords[i] != undefined) {
                // Check to make sure all words are the same length
                if (this.squareWords[i].length != word.length) return false;
                // Check to make sure characters are the same where words intersect
                if (this.squareWords[i].charAt(pos) != word.charAt(i)) return false;
            }
        }        
        this.squareWords[pos] = word;
        return true;
    },

    removeSquareWord: function(pos) {
        // Removes the word at the specified index from the data model
        this.squareWords[pos] = undefined;
    },

    getSquareWords: function() {
        // Returns the partial word square currently in the data model
        return this.squareWords.slice(0);
    },

    buildSolutions: function() {
        // Triggers the build process
        let len = this._checkLength();
        if (len <= 0) return;
        let searchRows = this._getSearchRows(len);
        this._buildAllSolutions(searchRows, 0, len);
        this._sortSolutions();
        this.squareWords = Array(6).fill(undefined);
    },
    
    getAllSolutions: function() {
        // Returns a 2D array of solution words
        let allSols = [];
        model.solutionList.forEach(function(element) {
            let solWords = element.solutionWords.slice(0);
            allSols.push(solWords);
        });
        return allSols;
    },

    getSolutionCount: function() {
        // Returns the number of solutions
        return this.solutionList.length;
    },

    getSolution: function(pos) {
        // Returns the solution words for the solution at the given index
        return this.solutionList[pos].solutionWords.slice(0);
    },

    clear: function() {
        // Clears the data model
        this.squareWords = Array(6).fill(undefined);
        this.solutionList = [];
    },

    /******************
     * Helper Methods
     ******************/

    _checkLength: function() {
        /**
         * Verifies that the partial word square input is valid.
         * Checks that all words are the same length and no word
         * is in an impossible position.
         * 
         * Returns the word square length (which is the same
         * for both the number of words and the number of characters
         * in each word.)
         */
        let len = 0;
        for (let i = 0; i < this.squareWords.length; i++) {
            if (this.squareWords[i] != undefined) {
                if (len == 0) len = this.squareWords[i].length;
                else {
                    if ((i >= len) ||
                    (this.squareWords[i].length != len)) {
                        return undefined;
                    }
                }
            }
        }
        return len;
    },
    
     _getSearchRows: function (len) {
        /**
         * Get the index of rows that need to be searched.
         * 
         * Return an array of the index of rows that neeed to be filled.
        */
        let searchRows = [];
        for (let i = 0; i < len; i++) {
            // If this spot is empty, we will need to search it.
            if (this.squareWords[i] == undefined) searchRows.push(i);
        }
        return searchRows;
    },

    _buildAllSolutions: function recurse (searchRows, pos, len) {
        let pattern = model._buildSearchPattern(searchRows[pos], len);
        let candidates = model.searchTree.matchPattern(pattern);
        for (let i = 0; i < candidates.length; i++) {
            model.squareWords[searchRows[pos]] = candidates[i];
            if (pos == searchRows.length - 1) {
                let sol = new Solution();
                sol.solutionWords = model.squareWords.slice(0, len);
                model._scoreSolution(sol);
                model.solutionList.push(sol);
            }
            else recurse(searchRows, pos + 1, len);
        };
        if (model.squareWords[searchRows[pos]] != undefined) {
            model.squareWords[searchRows[pos]] = undefined;
        }
    },
    
    _buildSearchPattern: function(pos, len) {
        // Loop through square words and build search pattern
        let pattern = '';
        for (let i = 0; i < len; i++) {
            if (this.squareWords[i] == undefined) pattern += '.';
            else pattern += this.squareWords[i].charAt(pos);
        }
        return pattern;
     },

    _scoreSolution: function(sol) {
        /**
         * Sets Solution score as the lowest individual word score.
         * Zipf's law makes sorting by average and total word score 
         * pointless.  Need to judge a solution by its worst word 
         * to weed out the oddballs.  However, this will leave
         * a lot of zero-score solutions, since there are a lot of
         * obscure words in the word bank.  That's ok, since no one
         * is likely to look at more than a few solutions for any
         * given search.
        */
       let lowScore = Number.MAX_SAFE_INTEGER;
       sol.solutionWords.forEach(function (word) {
           let test = model.searchTree.get(word);
           if (test == undefined) test = 0;
           if (test < lowScore) lowScore = test;
       });
       sol.score = lowScore;
    },

    _sortSolutions: function() {
        /**
         * Sort the Solution array by Solution.score.
         */
        this.solutionList.sort(function (a, b) {
            return b.score - a.score;
        });
    }
}

function Solution() {
    this.solutionWords = [];
    this.score = 0;
}
