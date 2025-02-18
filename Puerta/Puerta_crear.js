// Verificar si hay una sesión activa como admin
if (localStorage.getItem("admin") !== "true") {
    alert("Debes iniciar sesión como administrador.");
    window.location.href = "/Aplicacionesmoviles/index.html"; // Redirigir a la página de inicio de sesión
}

window.cerrarSesion = function () {
    localStorage.removeItem("admin"); // Eliminar sesión
    window.location.href = "/Aplicacionesmoviles/index.html"; // Redirigir a la página de inicio de sesión
};

// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

window.crearPuerta = function () {
    let nombre = document.getElementById("nombre").value.trim();
    let ubicacion = document.getElementById("ubicacion").value.trim();
    let contrasena = document.getElementById("contrasena").value.trim();

    // Validar que los campos no estén vacíos
    if (!nombre || !ubicacion || !contrasena) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Convertir la primera letra a mayúscula automáticamente
    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    nombre = capitalizar(nombre);
    ubicacion = capitalizar(ubicacion);

    // Referencia a la colección de puertas
    const puertasRef = ref(database, "Puertas");

    get(puertasRef).then((snapshot) => {
        if (snapshot.exists()) {
            let puertas = snapshot.val();

            // Verificar si ya existe una puerta con el mismo nombre
            if (puertas[nombre]) {
                alert("El nombre de la puerta ya está registrado.");
                return;
            }

            // Verificar si ya existe una puerta con la misma ubicación
            let ubicacionDuplicada = Object.values(puertas).some(p => p.ubicacion === ubicacion);
            if (ubicacionDuplicada) {
                alert("Ya existe una puerta en esta ubicación.");
                return;
            }
        }

        // Registrar la nueva puerta con su nombre como clave en Firebase
        const puertaRef = ref(database, `Puertas/${nombre}`);
        set(puertaRef, {
            nombre: nombre,
            ubicacion: ubicacion,
            contrasena: contrasena
        }).then(() => {
            alert("Puerta registrada exitosamente.");
            window.location.href = "/Aplicacionesmoviles/Administrador/InicioAd.html"; // Redirigir al administrador
        }).catch((error) => {
            alert("Error al registrar la puerta: " + error.message);
        });
    }).catch((error) => {
        alert("Error al verificar puertas: " + error.message);
    });
};
