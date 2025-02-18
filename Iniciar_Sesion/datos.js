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

// Obtener matrícula del usuario de localStorage
const matricula = localStorage.getItem("matricula");

if (matricula) {
    const usuarioRef = ref(database, "usuarios/" + matricula);
    get(usuarioRef).then((snapshot) => {
        if (snapshot.exists()) {
            let usuario = snapshot.val();
            document.getElementById("datosUsuario").innerHTML = `
                <p><strong>Nombre:</strong> ${usuario.nombre}</p>
                <p><strong>Matrícula:</strong> ${matricula}</p>
            `;
            
            // Guardar los datos del usuario en localStorage para el QR
            localStorage.setItem("nombre", usuario.nombre);
            localStorage.setItem("correo", usuario.correo);
            localStorage.setItem("puesto", usuario.puesto);

        } else {
            alert("No se encontraron los datos del usuario.");
        }
    }).catch((error) => {
        alert("Error al cargar datos: " + error.message);
    });
} else {
    alert("No hay sesión activa. Redirigiendo a inicio de sesión...");
    window.location.href = "/Registro_Trabajador/registro.html"; // Redirige al login si no hay sesión
}

// Función para cerrar sesión
window.cerrarSesion = function () {
    localStorage.removeItem("matricula"); // Eliminar datos de sesión
    window.location.href = "Inicio/index.html"; // Redirigir a la página de inicio de sesión
};

// Función para generar el QR al hacer clic en el botón
document.querySelector('.glass-button').addEventListener('click', function () {
    const nombre = localStorage.getItem("nombre");
    const correo = localStorage.getItem("correo");
    const puesto = localStorage.getItem("puesto");
    const matricula = localStorage.getItem("matricula");

    if (nombre && correo && puesto && matricula) {
        // Crear el objeto JSON con los datos
        const usuario = {
            matricula: matricula,
            puesto: puesto
        };

        // Crear el contenedor del QR
        const contenedorQR = document.createElement('div');
        contenedorQR.id = 'contenedorQR';
        contenedorQR.style.display = 'block'; // Asegurarse de que el QR esté en bloque
        contenedorQR.style.marginTop = '10px';  // Espacio entre los datos y el QR
        contenedorQR.style.clear = 'both'; // Evitar que el QR se quede flotando al lado

        // Insertar el contenedor del QR dentro del #datosUsuario
        const datosUsuario = document.getElementById("datosUsuario");
        datosUsuario.appendChild(contenedorQR); // Agregar el contenedor del QR dentro del glass-container

        // Crear el QR
        const QR = new QRCode(contenedorQR);
        QR.makeCode(JSON.stringify(usuario));  // Convertir el objeto JSON en un QR

        // Ocultar el botón de "Generar QR"
        document.querySelector('.glass-button').style.display = 'none';
    } else {
        alert("No se encuentran todos los datos del usuario.");
    }
});