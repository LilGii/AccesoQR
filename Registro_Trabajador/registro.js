// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de Firebase (reemplaza con tu API Key y App ID)
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

// Función para registrar usuario con validaciones
window.registrarUsuario = function () {
    let nombre = document.getElementById("nombre").value.trim();
    let matricula = document.getElementById("matricula").value.trim();
    let correo = document.getElementById("correo").value.trim();
    let contrasena = document.getElementById("contrasena").value.trim();
    let puesto = "";
    // 🔹 Validar que todos los campos estén llenos
    if (!nombre || !matricula || !correo || !contrasena) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // 🔹 Convertir primera letra de 'nombre' a mayúscula
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

    // 🔹 Validar que 'correo' sea válido (debe contener '@' y un dominio)
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correo)) {
        alert("Por favor, ingrese un correo válido.");
        return;
    }

    // 🔹 Validar que 'matricula' tenga exactamente 5 dígitos numéricos
    const matriculaRegex = /^[0-9]{9}$/;
    if (!matriculaRegex.test(matricula)) {
        alert("La matrícula debe ser un número de 5 dígitos.");
        return;
    }

    // 🔹 Validar que 'contraseña' tenga al menos 6 letras y 1 número
    const contrasenaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10}$/;
    if (!contrasenaRegex.test(contrasena)) {
        alert("La contraseña debe tenener 10 carácteres entre letras y números.");
        return;
    }

    // Verificar si la matrícula ya existe en Firebase
    const usuariosRef = ref(database, "usuarios/" + matricula);
    get(child(ref(database), "usuarios/" + matricula)).then((snapshot) => {
        if (snapshot.exists()) {
            alert("Error: Esta matrícula ya está registrada.");
        } else {
            // Guardar usuario en Firebase con la matrícula como ID
            set(usuariosRef, {
                nombre: nombre,
                matricula: matricula,
                correo: correo,
                contrasena: contrasena,  // ⚠️ hay que cifrar proximamente WP
                puesto: 'Trabajador'
            }).then(() => {
                alert("Usuario registrado con éxito.");
                window.location.href = "https://acceso-qr.vercel.app/Iniciar_Sesion/sesion.html";
            }).catch((error) => {
                alert("Error al registrar: " + error.message);
            });
        }
    }).catch((error) => {
        alert("Error al verificar matrícula: " + error.message);
    });
};
