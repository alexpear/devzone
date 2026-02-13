// Renders simple procgen faces.

class Face {
    constructor () {
        this.randomize();

        this.canvas = document.getElementById('faceCanvas');
        this.canvasCtx = this.canvas.getContext('2d');

        this.xmid = this.canvas.width / 2;

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
                    wideness: [10, 100],
                    tallness: [10, 100],
                },
            },
            nose: {
                inverted7: {
                    size: [10, 50],
                },
                // u: {
                //     wideness: [10, 200],
                //     tallness: [10, 100],
                // },
            },
            mouth: {
                curve: {
                    size: [10, 100],
                    curvature: [-1, 1],
                },
                ellipse: {
                    wideness: [10, 200],
                    tallness: [10, 50],
                },
            },
        };
    }

    render () {
        this.canvasCtx.strokeStyle = 'black';
        this.canvasCtx.lineWidth = 10; 

        this.renderEyes();
        this.renderNose();
        this.renderMouth();
        this.renderHair();
    }

    renderEyes () {
        if (this.eyes.shape === 'u') {
            this.renderUEyes();
        }
        else if (this.eyes.shape === 'v') {
            this.renderVEyes();
        }
        else if (this.eyes.shape === 'lemon') {
            this.renderLemonEyes();
        }
        else if (this.eyes.shape === 'ellipse') {
            this.renderEllipseEyes();
        }
    }

    renderVEyes () {
        
    }

    renderNose () {
        if (this.nose.shape === 'inverted7') {
            this.renderInverted7Nose();
        }
        // else if (this.nose.shape === 'inverted7') {
        //     this.renderInverted7Nose();
        // }
        // else if (this.nose.shape === 'inverted7') {
        //     this.renderInverted7Nose();
        // }
    }

    renderInverted7Nose () {
        const ydefault = this.canvas.height * 2 / 3;
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(
            this.xmid,
            ydefault - this.nose.size,
        );
        this.canvasCtx.lineTo(
            this.xmid + this.nose.size,
            ydefault + this.nose.size,
        );
        this.canvasCtx.lineTo(
            this.xmid,
            ydefault + this.nose.size,
        );
        this.canvasCtx.stroke();
    }

    renderMouth () {
        if (this.mouth.shape === 'curve') {
            this.renderCurveMouth();
        }
        else if (this.mouth.shape === 'ellipse') {
            this.renderEllipseMouth();
        }
    }

    renderCurveMouth () {
        const ydefault = this.canvas.height * 5 / 6;
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(
            this.xmid - this.mouth.size / 2,
            ydefault,
        );
        this.canvasCtx.quadraticCurveTo(
            this.xmid, 
            ydefault - this.mouth.curvature * this.mouth.size,
            this.xmid + this.mouth.size / 2, 
            ydefault,
        );
        this.canvasCtx.stroke();

        // Util.log({
        //     this.xmid,
        //     ythird,
        // });
    }

    renderEllipseMouth () {
        const ydefault = this.canvas.height * 5 / 6;
        this.canvasCtx.beginPath();
        this.canvasCtx.ellipse(
            this.xmid,
            ydefault,
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
