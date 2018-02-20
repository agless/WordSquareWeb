/*********************************************************************
 * Controller provides an interface between the model and view.
 *********************************************************************/

var controller = {
    
    /***********************
     * Member variables
     ***********************/
    
    searchTree: new TernaryTree(),
    editing: true,
    r: 0,
    c: 0,
    gameBoard: [],
    solutionCount: 0,
    currentSolution: 0,
    
    
    /***********************
     * API-like methods
     ***********************/
    
    gameBoardClick: function (row, column) {
        /**
         * Called by view when User clicks the game board
         */
        if (!this.editing) return;
        this.r = row;
        this.c = column;
        this._showPartialSquare();
    },

    keyPress: function (key) {
        /**
         * Called by view to handle keyboard input
         */ 
        if (!this.editing) return;
        else {
            // Handle arrows, tabs, backspace, enter, and character key input
            if ((key >= 'a') && (key <= 'z')) {
                this.gameBoard[this.r][this.c] = key;
                this.gameBoard[this.c][this.r] = key;
                this._goToNextEditable();
            }
            
            else if ((key == 'Enter') || key == ('Tab')) {
                if (this.r < 5) {
                    this.r++;
                    this.c = 0;
                    this._goToNextEditable();
                }
            } 
            
            else if (key == 'ArrowDown') {
                if (this.r < 5) this.r++;
                else (this.r = 0);
            } 
            
            else if (key == 'ArrowUp') {
                if (this.r > 0) this.r--;
                else (this.r = 5);
            } 
            
            else if (key == 'ArrowLeft') {
                if (this.c > 0) this.c--;
                else (this.c = 5);
            } 
            
            else if (key == 'ArrowRight') {
                if (this.c < 5) this.c++;
                else this.c = 0;
            } 
            
            else if (key == 'Delete') {
                this.gameBoard[this.r][this.c] = '';
                this.gameBoard[this.c][this.r] = '';
            } 
            
            else if (key == 'Backspace') {
                /* 
                Need to call goToPreviousEditable.
                The trick is figuring out which letters belong
                to the words from the rows above, and which are
                subject to deletion by backspace.
                (Could just jump up a row when c < r)
                (Or, skip this cell if [r-1][c] isn't empty)
                 */
                this.gameBoard[this.r][this.c] = '';
                this.gameBoard[this.c][this.r] = '';
                if (this.c > 0) this.c--;
                else if (this.r > 0) {
                    this.r--;
                    this.c = 5;
                }
            }
        }
        this._showPartialSquare();
    },

    clear: function () {
        /**
         * Called by view when user presses the 'Clear' button.
         * Clears all data from the model and view.
         */
        model.clear();
        this._clear();
        view.renderGameBoard(model.getSquareWords());
        view.renderSolutionCount(this.solutionCount);
        view.renderSolutionIndex(this.currentSolution);
        view.renderEditing(this.r, this.c);
    },
    
    getSolution: function (index) {
        /**
         * Called by view when user requests to see a particular solution.
         * Checks to make sure the request is valid.
         * Retrieves the requested solution from model and calls view
         * to update display elements.
         */
        if (index >= this.solutionCount) index = this.solutionCount;
        else if (index < 0) index = 0;
        view.renderGameBoard(model.getSolution(index));
        view.removeEditing();
        view.renderSolutionIndex(this.currentSolution + 1);
    },
    
    getNextSolution: function () {
        /**
         * Called by view when user requests to see the next solution.
         * Wraps to index zero when the end of the list is reached.
         * Retrieves the next solution from model and calls view to
         * update display elements.
         */
        if (this.currentSolution + 1 >= this.solutionCount) this.currentSolution = 0;
        else this.currentSolution++;
        view.renderGameBoard(model.getSolution(this.currentSolution));
        view.removeEditing();
        view.renderSolutionIndex(this.currentSolution + 1);
    },

    getPreviousSolution: function () {
        /**
         * Called by view when user requests to see the previous solution.
         * Wraps to end of list when the beginning of the list is reached.
         * Retrieves the previous solution from model and calls view to
         * update display elements.
         */
        if (this.currentSolution - 1 < 0) this.currentSolution = this.solutionCount - 1;
        else this.currentSolution--;
        view.renderGameBoard(model.getSolution(this.currentSolution));
        view.removeEditing();
        view.renderSolutionIndex(this.currentSolution + 1);
    },

    getSolutionCount: function () {
        /**
         * Retrieves solution count from model and calls view
         * to update the display.
         */
        this.solutionCount = model.getSolutionCount();
        view.renderSolutionCount(this.solutionCount);
    },

    buildSolutions: function () {
        /**
         * Triggers the model build process.
         * Resets member variables with new solution count and index zero.
         * Calls the view to update with the first solution in the list and
         * new solution count and index.
         */
        if (!this._attemptSubmit()) return;
        this.editing = false;
        model.buildSolutions();
        this.currentSolution = 0;
        this.solutionCount = model.getSolutionCount();
        if (this.solutionCount == 0) {
            alert("Sorry, no valid solutions exist.\nTry some different words?");
            this.editing = true;
            return;
        }
        view.renderGameBoard(model.getSolution(this.currentSolution));
        view.removeEditing();
        view.renderSolutionCount(this.solutionCount);
        view.renderSolutionIndex(this.currentSolution + 1);
    },

    /*******************
     * Helper methods
     *******************/

    _clear: function () {
        this.r = 0;
        this.c = 0;
        this._clearGameBoard();
        this.solutionCount = 0;
        this.currentSolution = 0;
        this.editing = true;
    },
    
    _attemptSubmit: function () {
        let i = 0;
        let j = 0;
        let words = Array(6).fill('');
        let len = 0;
        while (i < 6) {
            // Go through each row, one at a time
            words[i] = this.gameBoard[i].join('');
            if (words[i].length > len) len = words[i].length;
            i++;
        }
        words.forEach(function(word, index) {
            if (word.length == len) {
                if (!model.addSquareWord(word, index)) {
                    alert("Something went wrong!\n" + 
                        "Make sure all words are the same length and\n" + 
                        "your word square begins in the top left corner of the grid.");
                    model.clear();
                    return false;
                }
            }
        });
        return true;
    },

    _showPartialSquare: function () {
        // Build the partial word square for display
        let squareWords = Array(6);
        for (let i = 0; i < 6; i++) {
            let word = '';
            for (let j = 0; j < 6; j++) {
                if (this.gameBoard[i][j] == '') word += ' ';
                else word += this.gameBoard[i][j];
            }
            squareWords[i] = word;
        }
        view.renderGameBoard(squareWords);
        view.renderEditing(this.r, this.c);
    },

    _goToNextEditable: function () {
        while (this.gameBoard[this.r][this.c] != '') {
            if (this.c < 5) this.c++;
            else if (this.r < 5) {
                this.c = 0;
                this.r++;
            }
            if ((this.r == 5) && (this.c == 5)) break;
        }
    },

    _goToPreviousEditable: function () {
        // To be called when backspace is pressed
    },

    _clearGameBoard: function () {
        for (let i = 0; i < 6; i++) {
            this.gameBoard[i] = Array(6).fill('');
        }
    }
 }

 /********************************
 * Initialize search tree
 ********************************/

// Populate the search tree
$.ajax({
    url: 'res/wordBank.csv', // Hard coded for now.  Could be altered for custom word banks in the future.
    dataType: 'text'
}).done(function(data) {
    let words = data.split(/\r?\n|\r/);
    let lp = words.length / 2; // Pull from the center (a cheap hack to keep the tree somewhat balanced)
    let rp = lp + 1;
    while ((lp >= 0) || (rp < words.length)) {
        if (lp >=0) controller.searchTree.insertKey(words[lp--]);
        if (rp < words.length) controller.searchTree.insertKey(words[rp++]);
    }
});

// Store scores for most common words to improve search result ordering
// (Prefer solutions made of common words.)
$.ajax({
    url: 'res/scores.txt',
    dataType: 'text'
}).done(function(data) {
    let pairs = data.split(/\n/);
    pairs.forEach(function(pair) {
        let kvPair = pair.split(/\t/);
        if (isNaN(parseInt(kvPair[0]))) {
            kvPair[1] = parseInt(kvPair[1]);
            if (!isNaN(kvPair[1])) {
                controller.searchTree.set(kvPair[0], kvPair[1]);
            }
        }
    });
});

/**********************
 * Initialize gameboard
 **********************/

controller._clearGameBoard();

/**********************
 * Initialize model
 **********************/

// Give model a direct reference to the search tree.
model.searchTree = controller.searchTree;

/**********************
 * Initialize view
 **********************/

view.init();