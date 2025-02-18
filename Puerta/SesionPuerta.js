// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "qr-aplicaciones-moviles.firebaseapp.com",
    databaseURL: "https://qr-aplicaciones-moviles-default-rtdb.firebaseio.com/",
    projectId: "qr-aplicaciones-moviles",
    storageBucket: "qr-aplicaciones-moviles.appspot.com",
    messagingSenderId: "767462909837",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


window.iniciarSesion = function () {
    let nombre = document.getElementById("nombre").value.trim();
    let contrasena = document.getElementById("contrasena").value.trim();

    if (!nombre || !contrasena) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Convertir primera letra a mayúscula para coincidir con los registros
    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }
    nombre = capitalizar(nombre);

    // Referencia a la puerta en Firebase
    const puertaRef = ref(database, `Puertas/${nombre}`);

    get(puertaRef).then((snapshot) => {
        if (snapshot.exists()) {
            let puertaData = snapshot.val();

            if (puertaData.contrasena && puertaData.contrasena === contrasena) {
                alert("Inicio de sesión exitoso.");

                // Guardar sesión de la puerta en localStorage
                localStorage.setItem("puertaActiva", nombre);

                // Redirigir a Lector.html
                window.location.href = "/Aplicacionesmoviles/Lector/Lector.html";
            } else {
                alert("Contraseña incorrecta.");
            }
        } else {
            alert("La puerta no existe.");
        }
    }).catch((error) => {
        alert("Error al iniciar sesión: " + error.message);
    });
};
