// Renders simple procgen faces.


class Face {
    constructor () {
        this.randomize();

        this.canvas = document.getElementById('faceCanvas')
            .getContext('2d');
        // this.ctx = this.canvas.getContext('2d');
    }

    randomize () {
        const PARAM_RANGES = this.paramRanges();

        for (let shapeType in PARAM_RANGES) {
            const shapeList = Object.keys(PARAM_RANGES[shapeType]);

            const shape = Util.randomOf(shapeList);
            this[shapeType] = {
                shape,
            };

            const paramsObj = PARAM_RANGES[shapeType][shape];

            for (let param in paramsObj) {
                const range = [
                    paramsObj[param][0],
                    paramsObj[param][1],
                ];

                this[shapeType][param] = Util.randomRange(range[0], range[1]);
            }
        }
        
        // {
        //     eyes: {
        //         shape: 'lemon',
        //         tilt: 33,
        //     },
        //     nose: {
        //         ...
        //     },
        // }
    }

    paramRanges () {
        return {
            hair: {
                bald: {},
                // LATER more
            },
            eyes: {
                u: {
                    curvature: [0.1, 1],
                    tilt: [0, 360], // LATER allow pointing upish or downish, but not sideways
                    // LATER size
                },
                v: {
                    angle: [1, 180],
                    tilt: [0, 360], // LATER allow pointing upish or downish, but not sideways
                },
                lemon: {
                    tilt: [0, 60],
                },
                ellipse: {
                    tilt: [0, 360],
                    ellipticity: [0, 1],
                },
            },
            nose: {
                inverted7: {
                    size: [10, 100],
                },
                u: {
                    size: [10, 100],
                },
                w: {
                    size: [10, 100],
                },
            },
            mouth: {
                curve: {
                    size: [10, 100],
                    curvature: [-1, 1],
                },
                ellipse: {
                    size: [10, 100],
                    ellipticity: [0, 1],
                },
            },
        };
    }

    render () {
        // LATER output a image. Currently draw to html canvas.

        this.renderEyes();
        this.renderNose();
        this.renderMouth();
        this.renderHair();

        // DEBUG
        this.canvas.fillStyle = 'blue';
        this.canvas.fillRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);

        this.canvas.fillStyle = 'black';
        
        this.canvas.fillRect(50, 50, 50, 50);
        // TODO this test square is vertically stretched for some reason.
    }

    renderEyes () {

    }

    renderNose () {

    }

    renderMouth () {
        this.canvas.strokeStyle = 'black';
        this.canvas.lineWidth = 10;
        this.canvas.beginPath();
        this.canvas.moveTo(200, 500);
        this.canvas.quadraticCurveTo(300, 400, 400, 500);
        this.canvas.stroke();

        console.log('mouth stroked');
    }

    renderHair () {

    }

    json () {
        return {
            hair: this.hair,
            eyes: this.eyes,
            nose: this.nose,
            mouth: this.mouth,
        };
    }

    toString () {
        return JSON.stringify(
            this.json(),
            undefined,
            '    '
        );
    }

    static run () {
        window.addEventListener('load', () => {
            const face = new Face();

            face.render();

            Util.log(face.toString());
        });
    }
}

Face.run();
