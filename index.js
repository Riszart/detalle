/* Partículas de Fondo */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(251, 146, 60, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 25), 45);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}

/* Música de fondo generada con Tone.js (No requiere archivos externos) */
let bgMusicSynth;
let arpSequence;

function initAudio() {
    // 1. Limpiar y detener reproducciones anteriores 
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // 2. Establecer un Tempo normal (100 BPM es perfecto para esta canción)
    const bpm = 135
    Tone.Transport.bpm.value = bpm;
    const beatTime = 60 / bpm; // Calcula los segundos exactos por cada pulso

    // 3. Sintetizador para los Acordes (Acompañamiento de fondo)
    const chordSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1.5 }
    }).toDestination();
    chordSynth.volume.value = -12; // Volumen suave

    // 4. Sintetizador para la Melodía (La voz que canta)
    const melodySynth = new Tone.Synth({
        oscillator: { type: "sine" }, // Sonido más dulce y claro
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 1 }
    }).toDestination();
    melodySynth.volume.value = -2; // Más alto para que destaque

    // 5. Partitura de la melodía nota por nota con sus tiempos exactos
    const melody = [
        { beat: 0,   note: "G4", dur: "8n" }, { beat: 0.5, note: "G4", dur: "8n" }, // Cum - ple
        { beat: 1,   note: "A4", dur: "4n" }, { beat: 2,   note: "G4", dur: "4n" }, { beat: 3, note: "C5", dur: "4n" }, // a - ños - fe
        { beat: 4,   note: "B4", dur: "2n" }, // liz...
        
        { beat: 6,   note: "G4", dur: "8n" }, { beat: 6.5, note: "G4", dur: "8n" }, // te - de
        { beat: 7,   note: "A4", dur: "4n" }, { beat: 8,   note: "G4", dur: "4n" }, { beat: 9, note: "D5", dur: "4n" }, // se - a - mos
        { beat: 10,  note: "C5", dur: "2n" }, // a ti...
        
        { beat: 12,  note: "G4", dur: "8n" }, { beat: 12.5,note: "G4", dur: "8n" }, // cum - ple
        { beat: 13,  note: "G5", dur: "4n" }, { beat: 14,  note: "E5", dur: "4n" }, { beat: 15, note: "C5", dur: "4n" }, // a - ños - que
        { beat: 16,  note: "B4", dur: "4n" }, { beat: 17,  note: "A4", dur: "2n" }, // ri - do...
        
        { beat: 19,  note: "F5", dur: "8n" }, { beat: 19.5,note: "F5", dur: "8n" }, // cum - ple
        { beat: 20,  note: "E5", dur: "4n" }, { beat: 21,  note: "C5", dur: "4n" }, { beat: 22, note: "D5", dur: "4n" }, // a - ños - fe
        { beat: 23,  note: "C5", dur: "2n" }  // liz
    ];

    // 6. Acordes que acompañan en el momento exacto
    const chords = [
        { beat: 1,  notes: ["C4", "E4", "G4"], dur: "2n." }, // Do Mayor (Dura 3 pulsos)
        { beat: 4,  notes: ["G3", "B3", "D4"], dur: "2n." }, // Sol Mayor
        { beat: 7,  notes: ["G3", "B3", "D4"], dur: "2n." }, // Sol Mayor
        { beat: 10, notes: ["C4", "E4", "G4"], dur: "2n." }, // Do Mayor
        { beat: 13, notes: ["C4", "E4", "G4"], dur: "2n." }, // Do Mayor
        { beat: 16, notes: ["F3", "A3", "C4"], dur: "2n." }, // Fa Mayor
        { beat: 20, notes: ["C4", "E4", "G4"], dur: "2n" },  // Do Mayor (Dura 2 pulsos)
        { beat: 22, notes: ["G3", "B3", "D4"], dur: "4n" },  // Sol Mayor (Dura 1 pulso)
        { beat: 23, notes: ["C4", "E4", "G4"], dur: "2n." }  // Do Mayor final
    ];

    // 7. Programar la melodía en la línea de tiempo
    melody.forEach(item => {
        Tone.Transport.schedule(time => {
            melodySynth.triggerAttackRelease(item.note, item.dur, time);
        }, item.beat * beatTime); 
    });

    // 8. Programar los acordes en la línea de tiempo
    chords.forEach(item => {
        Tone.Transport.schedule(time => {
            chordSynth.triggerAttackRelease(item.notes, item.dur, time);
        }, item.beat * beatTime);
    });

    // 9. Detener el transporte unos segundos después de que acabe la canción
    Tone.Transport.schedule(time => {
        Tone.Transport.stop();
    }, 26 * beatTime);

    // 10. ¡Iniciar la reproducción!
    Tone.Transport.start();
}

function playFireworkSound() {
    // Sonido de estallido de fuegos artificiales
    const firework = new Tone.NoiseSynth({
        noise: { type: "pink" },
        envelope: {
            attack: 0.001,
            decay: 0.3,
            sustain: 0,
            release: 0.1
        }
    }).toDestination();
    firework.volume.value = -8; // Ajustar volumen
    // Variar ligeramente el tono del ruido para realismo
    firework.triggerAttackRelease("8n");
}

/* Lógica principal de la experiencia (Pastel -> Explosión -> Página principal) */
async function startExperience() {
    // 1. Iniciar Audio Context requerido por navegadores
    await Tone.start();
    initAudio();

    const btn = document.getElementById('blow-btn');
    const hint = document.getElementById('action-hint');
    const flames = document.querySelectorAll('.flame');
    const cakeWrapper = document.getElementById('cake-wrapper');
    const introTitle = document.getElementById('intro-title');
    
    // Cambiar botones visualmente
    btn.innerHTML = "¡Fiuuuuu! 🌬️";
    btn.classList.add('pointer-events-none', 'opacity-50');
    hint.style.opacity = '0';

    // 2. Apagar las velas
    flames.forEach(flame => flame.style.display = 'none');

    // 3. Esperar 1 segundo y EXPLOTAR EL PASTEL
    setTimeout(() => {
        playFireworkSound();
        autoLanzarConfeti();
        
        // Efecto de explosión en el pastel
        cakeWrapper.style.transform = "scale(2.5) translateY(50px)";
        cakeWrapper.style.opacity = "0";
        introTitle.style.opacity = "0";

        // 4. Iniciar la música de fondo
        Tone.Transport.start();

        // 5. Transición a la página principal
        setTimeout(() => {
            const introScreen = document.getElementById('intro-screen');
            introScreen.classList.add('opacity-0');
            
            setTimeout(() => {
                introScreen.style.display = 'none';
                const mainContent = document.getElementById('main-content');
                mainContent.classList.remove('hidden');
                
                // Forzar redibujado en navegador
                void mainContent.offsetWidth; 
                mainContent.classList.remove('opacity-0');

                // Confeti de bienvenida adicional en la página principal
                setTimeout(() => {
                    autoLanzarConfeti();
                    confetti({
                        particleCount: 80, spread: 100, origin: { y: 0.6 },
                        colors: ['#f59e0b', '#f43f5e', '#8b5cf6']
                    });
                }, 500);

            }, 1000); // Fin de fundido de la intro
        }, 600); // Retraso tras la explosión

    }, 1000);

}

// Efectos de Confeti Reutilizables
function triggerMassiveConfetti() {
    const count = 250;
    const defaults = { origin: { y: 0.7 }, zIndex: 60 };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f59e0b', '#ec4899'] });
    fire(0.2, { spread: 60, colors: ['#8b5cf6', '#38bdf8'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

function triggerFestiveConfetti() {
    // playFireworkSound();

    
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        playFireworkSound();

        const particleCount = 40 * (timeLeft / duration);
        confetti({
            particleCount, startVelocity: 30, spread: 360, ticks: 60,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#38bdf8', '#10b981']
        });
    }, 250);
}
function autoLanzarConfeti() {
    let contador = 0;
    
    // Ejecuta el primer disparo inmediatamente al hacer clic
    triggerFestiveConfetti();
    contador++;

    // Configura un intervalo que se repite cada 1000 ms (1 segundo)
    const intervalo = setInterval(() => {
        triggerFestiveConfetti();
        contador++;

        // Cuando el contador llega a 5 (es decir, 5 segundos/disparos), detiene el ciclo
        if (contador >= 10) {
            clearInterval(intervalo);
        }
    }, 500);
}

/* Funcionalidad Tarjetas Interactivas */
function revealCard(el) {
    const desc = el.querySelector('.card-desc');
    const hint = el.querySelector('.tap-hint');

    if (desc.classList.contains('hidden')) {
        playFireworkSound();
        autoLanzarConfeti()

        desc.classList.remove('hidden');
        hint.classList.add('hidden');
        el.classList.add('bg-slate-800/90', 'border-amber-500/40');

        const rect = el.getBoundingClientRect();
        confetti({
            particleCount: 20, spread: 50, zIndex: 20,
            origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            }
        });
    }
}

// Inicialización
window.onload = function() {
    initParticles();
    animateParticles();
};