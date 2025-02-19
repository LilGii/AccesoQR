// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Obtener elementos del DOM
const usuarioSelect = document.getElementById("usuarioSelect");
const infoUsuario = document.getElementById("infoUsuario");
const puestoSelect = document.getElementById("puestoSelect");

// Cargar usuarios en el select
function cargarUsuarios() {
    const usuariosRef = ref(database, "usuarios");

    get(usuariosRef).then((snapshot) => {
        if (snapshot.exists()) {
            let usuarios = snapshot.val();
            usuarioSelect.innerHTML = '<option value="">Selecciona un trabajador</option>';

            Object.keys(usuarios).forEach(matricula => {
                let usuario = usuarios[matricula];
                let option = document.createElement("option");
                option.value = matricula;
                option.textContent = usuario.nombre;
                option.setAttribute("data-puesto", usuario.puesto || "No asignado");
                usuarioSelect.appendChild(option);
            });
        } else {
            alert("No hay usuarios registrados.");
        }
    }).catch((error) => {
        alert("Error al cargar usuarios: " + error.message);
    });
}

// Mostrar información del usuario seleccionado
usuarioSelect.addEventListener("change", function () {
    let matricula = usuarioSelect.value;

    if (matricula) {
        const usuarioRef = ref(database, "usuarios/" + matricula);

        get(usuarioRef).then((snapshot) => {
            if (snapshot.exists()) {
                let usuario = snapshot.val();
                infoUsuario.textContent = `Nombre: ${usuario.nombre} | Puesto: ${usuario.puesto || "No asignado"}`;
            }
        }).catch((error) => {
            alert("Error al obtener información: " + error.message);
        });
    } else {
        infoUsuario.textContent = "";
    }
});

// Actualizar puesto en Firebase
window.actualizarPuesto = function () {
    let matricula = usuarioSelect.value;
    let nuevoPuesto = puestoSelect.value;

    if (!matricula || !nuevoPuesto) {
        alert("Por favor, selecciona un usuario y un nuevo puesto.");
        return;
    }

    const usuarioRef = ref(database, "usuarios/" + matricula);

    update(usuarioRef, { puesto: nuevoPuesto }).then(() => {
        alert("Puesto actualizado exitosamente.");
        puestoSelect.value = "";
        usuarioSelect.value = "";
        infoUsuario.textContent = "";
    }).catch((error) => {
        alert("Error al actualizar puesto: " + error.message);
    });
};

// Cargar usuarios al iniciar la página
cargarUsuarios();

// Verificar si hay una sesión activa como admin
if (localStorage.getItem("admin") !== "true") {
    alert("Debes iniciar sesión como administrador.");
    window.location.href = "https://acceso-qr.vercel.app/index.html"; // Redirigir a la página de inicio de sesión
}

window.cerrarSesion = function () {
    localStorage.removeItem("admin"); // Eliminar sesión
    window.location.href = "https://acceso-qr.vercel.app/index.html"; // Redirigir a la página de inicio de sesión
};
