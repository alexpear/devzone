// Renders simple procgen faces.

class Face {
    constructor () {
        this.randomize();

        this.canvas = document.getElementById('faceCanvas');
        this.canvasCtx = this.canvas.getContext('2d');

        window.face = this;
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

                this[shapeType][param] = Util.randomRange(
                    range[0], 
                    range[1],
                    1, // decimalPlaces
                );
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
                    size: [10, 200],
                },
                u: {
                    size: [10, 200],
                },
                w: {
                    size: [10, 200],
                },
            },
            mouth: {
                curve: {
                    size: [10, 300],
                    curvature: [-1, 1],
                },
                ellipse: {
                    wideness: [10, 200],
                    tallness: [10, 100],
                },
            },
        };
    }

    render () {
        this.renderEyes();
        this.renderNose();
        this.renderMouth();
        this.renderHair();
    }

    renderEyes () {

    }

    renderNose () {

    }

    renderMouth () {
        this.canvasCtx.strokeStyle = 'black';
        this.canvasCtx.lineWidth = 10;

        if (this.mouth.shape === 'curve') {
            this.renderCurveMouth();
        }
        else if (this.mouth.shape === 'ellipse') {
            this.renderEllipseMouth();
        }
    }

    renderCurveMouth () {
        const xmid = this.canvas.width / 2;
        const ythird = this.canvas.height * 2 / 3;
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(
            xmid - this.mouth.size / 2,
            ythird,
        );
        this.canvasCtx.quadraticCurveTo(
            xmid, 
            ythird - this.mouth.curvature * this.mouth.size,
            xmid + this.mouth.size / 2, 
            ythird,
        );
        this.canvasCtx.stroke();

        // Util.log({
        //     xmid,
        //     ythird,
        // });
    }

    renderEllipseMouth () {
        const xmid = this.canvas.width / 2;
        const ythird = this.canvas.height * 2 / 3;
        this.canvasCtx.beginPath();
        this.canvasCtx.ellipse(
            xmid,
            ythird,
            this.mouth.wideness,
            this.mouth.tallness,
            0,
            0,
            2 * Math.PI,
        );
        this.canvasCtx.stroke();
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
