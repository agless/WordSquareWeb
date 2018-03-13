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
                    let char = squareWords[r].charAt(c);
                    if (char == ' ') char = '';
                    this._renderChar(r, c, char);
                } else {
                    this._renderChar(r, c, '');
                }
            }
        }
    },

    renderSolutionIndex: function (index) {
        $('#solution-index-input').val(index);
    },

    renderSolutionCount: function (count) {
        $('#solution-count').text('of ' + count);
    },

    renderPrefixMatchResults: function (results) {
        let insertString = '<a class="dropdown-item" href="#">' + 
            results.join('</a><a class="dropdown-item" href="#">') + 
            '</a>';
        $('#prefix-match-results').empty().append(insertString);
    },

    renderPatternMatchResults: function (results) {
        let insertString = '<a class="dropdown-item" href="#">' + 
            results.join('</a><a class="dropdown-item" href="#">') + 
            '</a>';
        $('#pattern-match-results').empty().append(insertString);
    },

    renderEditing: function (row, cursor) {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                let color;
                if (((r == row) && (c == cursor)) || ((r == cursor) && (c == row))) color = '#1f7a8c';
                else if ((r == row) || (c == row)) color = '#bfdbf7';
                else color = '#e1e5f2';
                this._cellColor(r, c, color);
            }
        }
    },

    removeEditing: function() {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                this._cellColor(r, c, '#e1e5f2');
            }
        }
    },

    changeFocus: function(row, column) {
        $(this.gameBoard[row][column]).focus();
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
        $(this.gameBoard[row][column]).val(character);
        $(this.gameBoard[column][row]).val(character);
    },

    /*************************************
     * Listeners (call 'init()' to bind)
     *************************************/

    init: function () {
        // Set up listeners
        $('#game-board').click(function(event) {
            // Determine which input cell has been clicked and report it to the controller
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

        $('#solution-index-input').change(function (event) {
            // Request the solution by index from controller
            controller.getSolution(this.value);
        });

        $(document).keydown(function(event) {
            // Send all navigation / editing key presses to the controller
            // if in editng state
            if (!controller.getEditing()) return;
            switch (event.key) {
                case 'Enter':
                case 'Tab':
                case 'ArrowDown':
                case 'ArrowUp':
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'Delete':
                case 'Backspace':
                    controller.keyPress(event.key);
                    return;
            }

            if (((event.key >= 'a') && (event.key <= 'z')) ||
                    ((event.key >= 'A') && (event.key <= 'Z'))) {
                event.preventDefault();
                controller.keyPress(event.key.toLowerCase());
            }
        });

        $('.game-board-input').on('input', function(event) {
            // Handle 'swype' input
            if (!controller.getEditing()) return;
            else {
                let str = this.value.toLowerCase();
                // Remove whitespace, if any
                str = str.trim();
                // Only accept the first character for 'swype' inputs
                controller.keyPress(str[0]);
            }
        });

        $('#prefix-match').on('click', function() {
            // User is interacting with a bonus feature, so
            // prevent controller from sending keypresses to the gameboard
            controller.setEditing(false);
        });
        
        $('#prefix-match').on('input', function(event) {
            controller.setEditing(false);
            // Request prefix match count on User input
            let str = this.value.toLowerCase();
            let count = controller.getPrefixMatchCount(str);
            let message;
            if (count == 1) message = '1 Result';
            else message = count + ' Results';
            $('#prefix-match-count').text(message);
        });

        $('#prefix-match-dropdown').on('click', function() {
            // Request and build the result list only
            // when User clicks to see the results.
            let str = $('#prefix-match').val();
            controller.getPrefixMatches(str);
        });

        $('#pattern-match').on('click', function() {
            // User is interacting with a bonus feature, so
            // prevent controller from sending keypresses to the gameboard
            controller.setEditing(false);
        });
        
        $('#pattern-match').on('input', function(event) {
            controller.setEditing(false);
            // Request pattern match count on User input
            let str = this.value.toLowerCase();
            let count = controller.getPatternMatchCount(str);
            let message;
            if (count == 1) message = '1 Result';
            else message = count + ' Results';
            $('#pattern-match-count').text(message);
        });

        $('#pattern-match-dropdown').on('click', function() {
            // Request and build the result list only
            // when User clicks to see the results.
            let str = $('#pattern-match').val();
            controller.getPatternMatches(str);
        });

        /***********************
         * Set up game board
         ***********************/
        let rows = $('#game-board').children();
        for (let i = 0; i < 6; i++) {
            this.gameBoard[i] = $(rows[i]).children();
        }
        $(this.gameBoard[0][0]).focus();
    },
};