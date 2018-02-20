var view = {
    
    /**********************
     * Member variables
     **********************/

    // A grid of pointers to the gameboard cells.
    gameBoard: Array(6),
    
    /**********************
     * API-like methods
     **********************/

    renderGameBoard: function (squareWords) {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if ((squareWords[r] != undefined) && (c < squareWords[r].length)) {
                    this._renderChar(r, c, squareWords[r].charAt(c));
                } else {
                    this._renderChar(r, c, '');
                }
            }
        }
    },

    renderSolutionIndex: function (index) {
        //
    },

    renderSolutionCount: function (count) {
        //
    },

    renderPatternMatchResults: function (results) {
        //
    },

    renderPrefixMatchResults: function (results) {
        //
    },

    renderEditing: function (row, cursor) {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                let color;
                if (((r == row) && (c == cursor)) || ((r == cursor) && (c == row))) color = '#64affa';
                else if ((r == row) || (c == row)) color = '#96c8fa';
                else color = '#ffffff';
                this._cellColor(r, c, color);
            }
        }
    },

    removeEditing: function() {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                this._cellColor(r, c, '#ffffff');
            }
        }
    },
    
    /*********************
     * Helper methods
     *********************/

    _cellColor: function(row, column, color) {
        $(this.gameBoard[row][column]).css('background-color', color);
    },

    _renderChar(row, column, character) {
        /**
         * A valid word square reflects across the diagonal,
         * so most characters are added in two cells.
         */
        character = character.toUpperCase();
        $(this.gameBoard[row][column]).text(character);
        $(this.gameBoard[column][row]).text(character);
    },

    /*************************************
     * Listeners (call 'init()' to bind)
     *************************************/

    init: function () {
        // Set up listeners
        $('#game-board').click(function(event) {
            event.preventDefault();
            let row = $(event.target).parent().parent().children().index($(event.target).parent());
            let column = $(event.target).parent().children().index($(event.target));
            controller.gameBoardClick(row, column);
        });
        
        $('#search-button').click(function(event) {
            // Request controller to start the solution build process
            event.preventDefault();
            controller.buildSolutions();
        });

        $('#next-button').click(function(event) {
            // Request next solution from controller
            event.preventDefault();
            controller.getNextSolution();
        });

        $('#previous-button').click(function(event) {
            // Request previous solution from controller
            event.preventDefault();
            controller.getPreviousSolution();
        });

        $('#clear-button').click(function(event) {
            // Request controller to clear all
            event.preventDefault();
            controller.clear();
        });

        $(document).keydown(function(event) {
            // Send key presses to controller
            if (event.key != 'F12') {
                // Don't interrupt attempts to open the console.
                event.preventDefault();
                controller.keyPress(event.key);
            }
        });

        /***********************
         * Set up game board
         ***********************/
        let rows = $('#game-board').children();
        for (let i = 0; i < 6; i++) {
            this.gameBoard[i] = $(rows[i]).children();
        }
    },
};