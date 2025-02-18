// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Función para iniciar sesión
window.iniciarSesion = function () {
    let correo = document.getElementById("correo").value.trim();
    let contrasena = document.getElementById("contrasena").value.trim();

    if (!correo || !contrasena) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correo)) {
        alert("Ingrese un correo válido.");
        return;
    }

    const usuariosRef = ref(database, "usuarios");
    get(usuariosRef).then((snapshot) => {
        if (snapshot.exists()) {
            let usuarios = snapshot.val();
            let usuarioEncontrado = null;
            let matriculaEncontrada = null;

            for (let matricula in usuarios) {
                if (usuarios[matricula].correo === correo) {
                    usuarioEncontrado = usuarios[matricula];
                    matriculaEncontrada = matricula;
                    break;
                }
            }

            if (usuarioEncontrado) {
                if (usuarioEncontrado.contrasena === contrasena) {
                    alert("Inicio de sesión exitoso.");

                    // Guardar la matrícula en localStorage
                    localStorage.setItem("matricula", matriculaEncontrada);

                    // Redirigir a la página de perfil
                    window.location.href = "datos.html";
                } else {
                    alert("Contraseña incorrecta.");
                }
            } else {
                alert("Correo no registrado.");
            }
        } else {
            alert("No hay usuarios registrados.");
        }
    }).catch((error) => {
        alert("Error al iniciar sesión: " + error.message);
    });
};
