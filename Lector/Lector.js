// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "qr-aplicaciones-moviles.firebaseapp.com",
    databaseURL: "https://qr-aplicaciones-moviles-default-rtdb.firebaseio.com/",
    projectId: "qr-aplicaciones-moviles",
    storageBucket: "qr-aplicaciones-moviles.appspot.com",
    messagingSenderId: "767462909837",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultadoDiv = document.getElementById('resultado');

let stream;

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(newStream => {
            stream = newStream;
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            requestAnimationFrame(scanQRCode);
            resultadoDiv.innerHTML = `<div class="icons8-lock"></div><p>Escaneando...</p>`;
        })
        .catch(err => {
            console.error('Error accediendo a la cámara: ', err);
        });
}

function playSound(soundPath) {
    return new Promise(resolve => {
        const audio = new Audio(soundPath);
        audio.play();
        audio.onended = resolve; // Espera a que termine el sonido antes de continuar
    });
}

function scanQRCode() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
    
        if (code && code.data.trim() !== "") {
            const qrData = JSON.parse(code.data);
            procesarRegistro(qrData.matricula, qrData.puesto);
            resultadoDiv.innerHTML = `<p>Procesando registro...</p>`;
            video.srcObject.getTracks().forEach(track => track.stop());
        } else {
            requestAnimationFrame(scanQRCode);
        }
    } else {
        requestAnimationFrame(scanQRCode);
    }
}

async function procesarRegistro(matricula, puesto) {
    const userRef = ref(database, `usuarios/${matricula}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
        resultadoDiv.innerHTML = `<i class="fa-solid fa-circle-xmark iconopuerta"></i><br> Usuario no encontrado`;
        await playSound("https://acceso-qr.vercel.app/sounds/Denegado.mp3");
        startCamera();
        return;
    }

    const usuario = snapshot.val();
    if (usuario.puesto !== puesto) {
        resultadoDiv.innerHTML = `<i class="fa-solid fa-circle-xmark iconopuerta"></i><br> QR Incorrecto Actualice QR`;
        await playSound("https://acceso-qr.vercel.app/sounds/Denegado.mp3");
        startCamera();
        return;
    }

    const fechaHoraActual = new Date();
    const fechaActual = fechaHoraActual.toISOString().split('T')[0];
    const horaActual = fechaHoraActual.toTimeString().split(' ')[0];

    const entradaRef = ref(database, `usuarios/${matricula}/Registro/Entrada`);
    const salidaRef = ref(database, `usuarios/${matricula}/Registro/Salida`);
    
    const entradaSnapshot = await get(entradaRef);
    const salidaSnapshot = await get(salidaRef);
    
    const ultimaEntrada = entradaSnapshot.exists() ? Object.values(entradaSnapshot.val()).pop() : null;
    const ultimaSalida = salidaSnapshot.exists() ? Object.values(salidaSnapshot.val()).pop() : null;

    if (!ultimaEntrada || !ultimaEntrada.Fecha.startsWith(fechaActual)) {
        await push(entradaRef, { Fecha: fechaActual, Hora: horaActual });
        await push(salidaRef, { Fecha: fechaActual, Hora: "No registrada" });
        video.style.display = "none";
        resultadoDiv.innerHTML = `<i class="fa-solid fa-circle-check iconopuerta"></i><br>Entrada registrada`;
        await playSound("https://acceso-qr.vercel.app/sounds/Acceso.mp3");
    } else {
        const salidaActual = salidaSnapshot.exists() ? Object.values(salidaSnapshot.val()).find(s => s.Fecha === fechaActual) : null;

        if (salidaActual && salidaActual.Hora === "No registrada") {
            const salidaKey = Object.keys(salidaSnapshot.val()).find(key => salidaSnapshot.val()[key].Fecha === fechaActual);
            await set(ref(database, `usuarios/${matricula}/Registro/Salida/${salidaKey}`), {
                Fecha: fechaActual,
                Hora: horaActual
            });
            video.style.display = "none"; // Ocultar la cámara
            resultadoDiv.innerHTML = `<i class="fa-solid fa-circle-check iconopuerta"></i><br> Salida registrada`;
            await playSound("https://acceso-qr.vercel.app/sounds/Acceso.mp3");
        } else {
            video.style.display = "none"; // Ocultar la cámara
            resultadoDiv.innerHTML = `<i class="fa-solid fa-circle-xmark iconopuerta"></i><br> Ya se registró la salida hoy`;
            await playSound("https://acceso-qr.vercel.app/sounds/Denegado.mp3");
        }
    }
    
    setTimeout(() => {
        resultadoDiv.innerHTML = `<div class="icons8-lock"></div><p>Escaneando...</p>`;
        video.style.display = "block"; // Volver a mostrar la cámara
        startCamera();
    }, 0); // Mostrar la cámara después de 3 segundos
}


startCamera();
