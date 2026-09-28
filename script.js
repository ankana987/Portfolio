const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach((card) => {

    card.addEventListener("click", () => {

        const title = card.querySelector("h2").textContent;

        console.log("Opening project:", title);

        // You can add project URLs here later
    });

}); 
 
 
 /* =========================
           CANVAS
        ========================= */

        const canvas =
            document.getElementById("canvas");

        const ctx =
            canvas.getContext("2d", {
                alpha: false
            });


        const container =
            document.querySelector(".portrait-wrapper");


        /* =========================
           SOURCE IMAGE
        ========================= */

        const sourceImage =
            new Image();

        sourceImage.src =
            "source.png";


        /* =========================
           VARIABLES
        ========================= */

        let particles = [];

        let W = 0;
        let H = 0;

        let dpr = 1;

        let imageBox = null;

        let imageCanvas;
        let imageCtx;
        let imageData;

        let lastTime =
            performance.now();


        /* =========================
           CONFIG
        ========================= */

        const CONFIG = {

            particleSpacing: 3.0,

            particleSize: 1.0,

            particleOpacity: 0.88,

            particleColor: "#e0aaff",

            interactionRadius: 110,

            interactionStrength: 1.35,

            springStrength: 0.075,

            damping: 0.84,

            swirlStrength: 1.75,

            waveStrength: 0.22,

            darknessThreshold: 0.055,

            jitter: 0.55,

            maxParticles: 1200000

        };


        /* =========================
           MOUSE
        ========================= */

        const mouse = {

            x: -9999,

            y: -9999,

            vx: 0,

            vy: 0,

            active: false,

            lastX: -9999,

            lastY: -9999,

            radius: 0

        };


        /* =========================
           RESIZE
        ========================= */

        function resize() {

            dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );


            /*
                IMPORTANT:

                Instead of using:

                window.innerWidth
                window.innerHeight

                we use the size of the
                30% portrait container.
            */

            W =
                container.clientWidth;

            H =
                container.clientHeight;


            canvas.width =
                Math.floor(W * dpr);

            canvas.height =
                Math.floor(H * dpr);


            canvas.style.width =
                W + "px";

            canvas.style.height =
                H + "px";


            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );


            buildParticles();

        }


        /* =========================
           BUILD PARTICLES
        ========================= */

        function buildParticles() {

            if (
                !sourceImage.complete ||
                !sourceImage.naturalWidth
            ) {
                return;
            }


            /*
                Create a small
                invisible canvas for
                reading image pixels.
            */

            const sampleScale =
                Math.min(
                    1,
                    1000 /
                    Math.max(
                        sourceImage.naturalWidth,
                        sourceImage.naturalHeight
                    )
                );


            const iw =
                Math.max(
                    1,
                    Math.floor(
                        sourceImage.naturalWidth *
                        sampleScale
                    )
                );


            const ih =
                Math.max(
                    1,
                    Math.floor(
                        sourceImage.naturalHeight *
                        sampleScale
                    )
                );


            imageCanvas =
                document.createElement(
                    "canvas"
                );


            imageCanvas.width = iw;

            imageCanvas.height = ih;


            imageCtx =
                imageCanvas.getContext(
                    "2d",
                    {
                        willReadFrequently: true
                    }
                );


            imageCtx.drawImage(
                sourceImage,
                0,
                0,
                iw,
                ih
            );


            imageData =
                imageCtx.getImageData(
                    0,
                    0,
                    iw,
                    ih
                ).data;


            /* =========================
               PORTRAIT SIZE
            ========================= */

            const maxW =
                W * 0.95;

            const maxH =
                H * 0.95;


            const scale =
                Math.min(

                    maxW /
                    sourceImage.naturalWidth,

                    maxH /
                    sourceImage.naturalHeight

                );


            const drawW =
                sourceImage.naturalWidth *
                scale;


            const drawH =
                sourceImage.naturalHeight *
                scale;


            /*
                Center the portrait
                inside the 30% area.
            */

            imageBox = {

                x:
                    (W - drawW) * 0.5,

                y:
                    (H - drawH) * 0.5,

                width:
                    drawW,

                height:
                    drawH

            };


            particles = [];


            const step =
                CONFIG.particleSpacing;


            const sx =
                iw / drawW;


            const sy =
                ih / drawH;


            /* =========================
               READ IMAGE
            ========================= */

            for (
                let y = 0;
                y < drawH;
                y += step
            ) {

                for (
                    let x = 0;
                    x < drawW;
                    x += step
                ) {


                    const px =
                        Math.min(
                            iw - 1,
                            Math.floor(
                                x * sx
                            )
                        );


                    const py =
                        Math.min(
                            ih - 1,
                            Math.floor(
                                y * sy
                            )
                        );


                    const index =
                        (py * iw + px) * 4;


                    const r =
                        imageData[index];


                    const g =
                        imageData[index + 1];


                    const b =
                        imageData[index + 2];


                    const a =
                        imageData[index + 3] /
                        255;


                    if (a < 0.01) {
                        continue;
                    }


                    /*
                        Calculate brightness.
                    */

                    const luminance =

                        (
                            0.2126 * r +
                            0.7152 * g +
                            0.0722 * b
                        ) / 255;


                    const darkness =
                        1 - luminance;


                    /*
                        Ignore white
                        background.
                    */

                    if (
                        darkness <
                        CONFIG.darknessThreshold
                    ) {
                        continue;
                    }


                    /*
                        Darker areas
                        receive more particles.
                    */

                    const density =
                        Math.min(
                            1,
                            Math.pow(
                                darkness,
                                0.72
                            )
                        );


                    if (
                        Math.random() >
                        density
                    ) {
                        continue;
                    }


                    const ox =

                        imageBox.x +
                        x +
                        (
                            Math.random() -
                            0.5
                        ) *
                        CONFIG.jitter;


                    const oy =

                        imageBox.y +
                        y +
                        (
                            Math.random() -
                            0.5
                        ) *
                        CONFIG.jitter;


                    particles.push({

                        x: ox,

                        y: oy,

                        ox: ox,

                        oy: oy,

                        vx: 0,

                        vy: 0,

                        darkness:

                            darkness,

                        phase:

                            Math.random() *
                            Math.PI *
                            2,

                        size:

                            CONFIG.particleSize *
                            (
                                0.65 +
                                darkness *
                                0.75
                            )

                    });

                }

            }


            /* =========================
               PARTICLE LIMIT
            ========================= */

            if (
                particles.length >
                CONFIG.maxParticles
            ) {

                particles =
                    particles
                        .sort(
                            () =>
                                Math.random() -
                                0.5
                        )
                        .slice(
                            0,
                            CONFIG.maxParticles
                        );

            }

        }


        /* =========================
           POINTER
        ========================= */

        function updatePointer(
            clientX,
            clientY
        ) {

            const rect =
                canvas.getBoundingClientRect();


            /*
                Convert browser
                coordinates to
                canvas-local coordinates.
            */

            const x =
                clientX -
                rect.left;


            const y =
                clientY -
                rect.top;


            if (
                mouse.lastX > -9000
            ) {

                mouse.vx =
                    x -
                    mouse.lastX;

                mouse.vy =
                    y -
                    mouse.lastY;

            }


            mouse.x = x;

            mouse.y = y;

            mouse.lastX = x;

            mouse.lastY = y;

            mouse.active = true;

        }


        /* =========================
           MOUSE EVENTS
        ========================= */

        canvas.addEventListener(
            "pointermove",
            (e) => {

                updatePointer(
                    e.clientX,
                    e.clientY
                );

            }
        );


        canvas.addEventListener(
            "pointerenter",
            (e) => {

                updatePointer(
                    e.clientX,
                    e.clientY
                );

                mouse.active = true;

            }
        );


        canvas.addEventListener(
            "pointerleave",
            () => {

                mouse.active = false;

                mouse.vx *= 0.25;

                mouse.vy *= 0.25;

            }
        );


        /* =========================
           TOUCH
        ========================= */

        canvas.addEventListener(
            "touchstart",
            (e) => {

                if (
                    !e.touches.length
                ) {
                    return;
                }


                const t =
                    e.touches[0];


                updatePointer(
                    t.clientX,
                    t.clientY
                );

            },
            {
                passive: true
            }
        );


        canvas.addEventListener(
            "touchmove",
            (e) => {

                if (
                    !e.touches.length
                ) {
                    return;
                }


                const t =
                    e.touches[0];


                updatePointer(
                    t.clientX,
                    t.clientY
                );

            },
            {
                passive: true
            }
        );


        canvas.addEventListener(
            "touchend",
            () => {

                mouse.active = false;

            }
        );


        /* =========================
           PARTICLE PHYSICS
        ========================= */

        function updateParticles(
            dt,
            time
        ) {

            const radius =
                CONFIG.interactionRadius;


            const radiusSq =
                radius * radius;


            const frame =
                Math.min(
                    2,
                    dt / 16.67
                );


            for (
                const p of particles
            ) {


                /* =========================
                   SPRING
                ========================= */

                let fx =
                    (
                        p.ox -
                        p.x
                    ) *
                    CONFIG.springStrength;


                let fy =
                    (
                        p.oy -
                        p.y
                    ) *
                    CONFIG.springStrength;


                /* =========================
                   WAVE
                ========================= */

                const wave =

                    Math.sin(

                        p.ox *
                        0.025 +

                        time *
                        0.0015 +

                        p.phase

                    ) *
                    CONFIG.waveStrength *
                    p.darkness;


                fy += wave;


                /* =========================
                   MOUSE
                ========================= */

                if (
                    mouse.active
                ) {

                    const dx =
                        p.x -
                        mouse.x;


                    const dy =
                        p.y -
                        mouse.y;


                    const distSq =
                        dx * dx +
                        dy * dy;


                    if (
                        distSq <
                        radiusSq
                    ) {

                        const dist =
                            Math.sqrt(
                                distSq
                            ) ||
                            0.001;


                        const falloff =
                            Math.pow(
                                1 -
                                dist /
                                radius,
                                2
                            );


                        const nx =
                            dx / dist;


                        const ny =
                            dy / dist;


                        /* RADIAL PUSH */

                        const radial =

                            CONFIG.interactionStrength *
                            falloff *
                            (
                                0.45 +
                                Math.min(
                                    2.0,
                                    Math.hypot(
                                        mouse.vx,
                                        mouse.vy
                                    ) *
                                    0.08
                                )
                            );


                        fx +=
                            nx *
                            radial;


                        fy +=
                            ny *
                            radial;


                        /* SWIRL */

                        const tangentX =
                            -ny;


                        const tangentY =
                            nx;


                        const mouseSpeed =
                            Math.min(
                                4,
                                Math.hypot(
                                    mouse.vx,
                                    mouse.vy
                                )
                            );


                        const swirl =

                            CONFIG.swirlStrength *
                            falloff *
                            (
                                0.35 +
                                mouseSpeed *
                                0.12
                            );


                        fx +=
                            tangentX *
                            swirl;


                        fy +=
                            tangentY *
                            swirl;


                        /* MOUSE WAKE */

                        fx +=
                            mouse.vx *
                            falloff *
                            0.055;


                        fy +=
                            mouse.vy *
                            falloff *
                            0.055;

                    }

                }


                /* =========================
                   VELOCITY
                ========================= */

                p.vx +=
                    fx *
                    frame;


                p.vy +=
                    fy *
                    frame;


                /* DAMPING */

                p.vx *=
                    Math.pow(
                        CONFIG.damping,
                        frame
                    );


                p.vy *=
                    Math.pow(
                        CONFIG.damping,
                        frame
                    );


                /* SPEED LIMIT */

                const speed =
                    Math.hypot(
                        p.vx,
                        p.vy
                    );


                const maxSpeed = 8;


                if (
                    speed >
                    maxSpeed
                ) {

                    p.vx =
                        (
                            p.vx /
                            speed
                        ) *
                        maxSpeed;


                    p.vy =
                        (
                            p.vy /
                            speed
                        ) *
                        maxSpeed;

                }


                /* POSITION */

                p.x +=
                    p.vx *
                    frame;


                p.y +=
                    p.vy *
                    frame;

            }


            /* Mouse friction */

            mouse.vx *=
                Math.pow(
                    0.72,
                    frame
                );


            mouse.vy *=
                Math.pow(
                    0.72,
                    frame
                );

        }


        /* =========================
           RENDER
        ========================= */

        function render(time) {

            /*
                Dark background.
            */

            ctx.fillStyle =
                "#10002b";


            ctx.fillRect(
                0,
                0,
                W,
                H
            );


            /* =========================
               PARTICLES
            ========================= */

            for (
                const p of particles
            ) {

                const alpha =

                    CONFIG.particleOpacity *
                    (
                        0.25 +
                        p.darkness *
                        0.95
                    );


                ctx.globalAlpha =
                    Math.min(
                        1,
                        alpha
                    );


                /* Small pulse */

                const pulse =

                    1 +
                    Math.sin(
                        time *
                        0.002 +
                        p.phase
                    ) *
                    0.08;


                const size =
                    p.size *
                    pulse;


                ctx.fillStyle =
                    CONFIG.particleColor;


                /*
                    Dark areas become
                    small "+" characters.
                */

                if (
                    p.darkness >
                    0.68 &&
                    p.size > 1
                ) {

                    const s =
                        size *
                        0.75;


                    ctx.fillRect(
                        p.x - s,
                        p.y - 0.35,
                        s * 2,
                        0.7
                    );


                    ctx.fillRect(
                        p.x - 0.35,
                        p.y - s,
                        0.7,
                        s * 2
                    );

                } else {

                    ctx.beginPath();


                    ctx.arc(
                        p.x,
                        p.y,
                        size,
                        0,
                        Math.PI * 2
                    );


                    ctx.fill();

                }

            }


            ctx.globalAlpha = 1;


            /* =========================
               MOUSE GLOW
            ========================= */

            if (
                mouse.active
            ) {

                const radius =
                    mouse.radius ||
                    CONFIG.interactionRadius;


                const gradient =
                    ctx.createRadialGradient(

                        mouse.x,
                        mouse.y,
                        0,

                        mouse.x,
                        mouse.y,
                        radius

                    );


                gradient.addColorStop(
                    0,
                    "rgba(69,243,223,0.05)"
                );


                gradient.addColorStop(
                    0.55,
                    "rgba(69,243,223,0.015)"
                );


                gradient.addColorStop(
                    1,
                    "rgba(69,243,223,0)"
                );


                ctx.fillStyle =
                    gradient;


                ctx.beginPath();


                ctx.arc(
                    mouse.x,
                    mouse.y,
                    radius,
                    0,
                    Math.PI * 2
                );


                ctx.fill();

            }

        }


        /* =========================
           ANIMATION LOOP
        ========================= */

        function animate(now) {

            const dt =
                Math.min(
                    40,
                    now -
                    lastTime
                );


            lastTime =
                now;


            const targetRadius =
                mouse.active
                    ? CONFIG.interactionRadius
                    : 0;


            mouse.radius +=

                (
                    targetRadius -
                    mouse.radius
                ) *
                0.12;


            updateParticles(
                dt,
                now
            );


            render(
                now
            );


            requestAnimationFrame(
                animate
            );

        }


        /* =========================
           IMAGE LOAD
        ========================= */

        sourceImage.onload = () => {

            resize();

            requestAnimationFrame(
                animate
            );

        };


        /* =========================
           IMAGE ERROR
        ========================= */

        sourceImage.onerror = () => {

            W =
                container.clientWidth;

            H =
                container.clientHeight;


            ctx.fillStyle =
                "#061426";


            ctx.fillRect(
                0,
                0,
                W,
                H
            );


            ctx.fillStyle =
                "#45f3df";


            ctx.font =
                "14px Arial";


            ctx.textAlign =
                "center";


            ctx.fillText(
                "source.png could not be loaded",
                W / 2,
                H / 2
            );

        };


        /* =========================
           WINDOW RESIZE
        ========================= */

        window.addEventListener(
            "resize",
            resize
        );



