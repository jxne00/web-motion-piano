var audio = new p5.MonoSynth();

class Grid {
    constructor(_w, _h) {
        this.gridWidth = _w;
        this.gridHeight = _h;
        this.noteSize = 40;
        this.notePos = [];
        this.noteState = [];
        // the music notes to be played when activated
        this.noteToPlay = [];

        // initalise grid structure and state
        for (var x = 0; x < _w; x += this.noteSize) {
            // row
            var posColumn = [];
            var stateColumn = [];
            var noteColumn = [];

            for (var y = 0; y < _h; y += this.noteSize) {
                // col
                posColumn.push(
                    createVector(x + this.noteSize / 2, y + this.noteSize / 2)
                );
                stateColumn.push(0);

                /***************************************************
                 * Set a random musical note using pitch and octave
                 * based on activated note's position on the grid structure.
                 *
                 * 1. Bottom left quarter: high pitch, high octave
                 * 2. Top left quarter: high pitch, low octave
                 * 3. Bottom right quarter: low pitch, high octave
                 * 4. Top right quarter: low pitch, low octave
                 ****************************************************/
                var note;
                if (x < _w / 2) {
                    if (y > _h / 2)
                        // bottom left quarter
                        note = random(['D', 'E', 'F', 'G']) + 5;
                    // top left quarter
                    else note = random(['D', 'E', 'F', 'G']) + 4;
                } else {
                    if (y > _h / 2)
                        // bottom right quarter
                        note = random(['A', 'B', 'Bb', 'C']) + 5;
                    // top right quarter
                    else note = random(['A', 'B', 'Bb', 'C']) + 4;
                }
                // store music note of each column
                noteColumn.push(note);
            }
            this.notePos.push(posColumn);
            this.noteState.push(stateColumn);
            this.noteToPlay.push(noteColumn);
        }
    }

    run(img) {
        img.loadPixels();
        this.findActiveNotes(img);
        this.drawActiveNotes(img);
    }

    drawActiveNotes(img) {
        fill(255);
        noStroke();

        for (var i = 0; i < this.notePos.length; i++) {
            for (var j = 0; j < this.notePos[i].length; j++) {
                var x = this.notePos[i][j].x;
                var y = this.notePos[i][j].y;

                if (this.noteState[i][j] > 0) {
                    var alpha = this.noteState[i][j] * 200;

                    // customise color of notes
                    var c1 = color(20, 30, random(100, 255), alpha);
                    var c2 = color(random(100, 250), 10, 20, alpha);
                    var mix = lerpColor(c1, c2, map(i, 0, this.notePos.length, 0, 1));
                    fill(mix);

                    // add stroke with alternate colors
                    strokeWeight(1);
                    if ((i % 2 == 0 && j % 2 == 1) || (i % 2 == 1 && j % 2 == 0))
                        stroke(255, 218, 31); // yellow
                    else stroke(21, 244, 181); // green

                    // draw notes as rectangles with rounded borders
                    var s = this.noteState[i][j];
                    rectMode(CENTER);
                    var radius = random(3, 25);
                    rect(x, y, this.noteSize * s, this.noteSize * s, radius);

                    // draw a triangle on random activated notes
                    if (s == 1 && random([0, 1]) == 0) {
                        push();
                        noFill();
                        // set random size and color
                        stroke(random(255), random(255), random(255));
                        var l = this.noteSize * s + random(10, 50);
                        triangle(x, y - l, x - l, y + l, x + l, y + l);
                        pop();
                    }

                    // make 'trail' by drawing another ellipse
                    // without fill, with width and height randomized.
                    if (this.noteState[i][j] < 0.5) {
                        noFill();
                        stroke(128, 128, 128);
                        ellipse(
                            x,
                            y,
                            random(15, 20) + this.noteSize * s,
                            random(15, 20) + this.noteSize * s
                        );
                    }

                    /**
                     * play audio only when the note is first activated,
                     * and when noteState is between 0.5 to 0.3. This produces
                     * a 'cleaner' sound as compared to if sound is played
                     * on every single loop.
                     */
                    if (s == 1 || (s <= 0.5 && s >= 0.3)) this.playAudio(i, j);
                }
                this.noteState[i][j] -= 0.05;
                this.noteState[i][j] = constrain(this.noteState[i][j], 0, 1);
            }
        }
    }

    findActiveNotes(img) {
        for (var x = 0; x < img.width; x += 1) {
            for (var y = 0; y < img.height; y += 1) {
                var index = (x + y * img.width) * 4;
                var state = img.pixels[index + 0];

                if (state == 0) {
                    // if pixel is black (ie there is movement)
                    // find which note to activate
                    var screenX = map(x, 0, img.width, 0, this.gridWidth);
                    var screenY = map(y, 0, img.height, 0, this.gridHeight);
                    var i = int(screenX / this.noteSize);
                    var j = int(screenY / this.noteSize);
                    this.noteState[i][j] = 1;
                }
            }
        }
    }

    /** start and play audio */
    playAudio(i, j) {
        // start audio context
        userStartAudio();

        // music note to play
        var note = this.noteToPlay[i][j];
        // set volume based on noteState of activated note
        // so that it gives a "fading" audio effect
        var vol = this.noteState[i][j];

        // play audio
        audio.play(
            note,
            vol,
            0, // start 0 seconds from now
            1 // sustain note for 1 second
        );
    }
}
