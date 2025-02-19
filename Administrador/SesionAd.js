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

// Verificar si hay una sesión activa
if (localStorage.getItem("admin") === "true") {
    window.location.href = "https://acceso-qr.vercel.app/Aministrador/InicioAd.html"; // Redirige si ya está logueado
}

window.iniciarSesion = function () {
    let usuario = document.getElementById("usuario").value.trim();
    let contrasena = document.getElementById("contrasena").value.trim();

    if (!usuario || !contrasena) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const usuarioAdmin = "Admin";

    if (usuario !== usuarioAdmin) {
        alert("No tienes permisos de administrador.");
        return;
    }

    const adminRef = ref(database, "Admin");

    get(adminRef).then((snapshot) => {
        if (snapshot.exists()) {
            let adminData = snapshot.val();

            if (adminData.contrasena && adminData.contrasena.toString() === contrasena) {
                alert("Inicio de sesión exitoso como administrador.");

                // Guardar sesión en localStorage
                localStorage.setItem("admin", "true");

                // Redirigir a InicioAd.html
                window.location.href = "https://acceso-qr.vercel.app/Aministrador/InicioAd.html";
            } else {
                alert("Contraseña incorrecta.");
            }
        } else {
            alert("No se encontró la cuenta de administrador.");
        }
    }).catch((error) => {
        alert("Error al iniciar sesión: " + error.message);
    });
};
