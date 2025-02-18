import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const db = getDatabase(app);

const filtroTrabajador = document.getElementById("filtroTrabajador");
const filtroFecha = document.getElementById("filtroFecha");
const tablaHistorial = document.getElementById("tablaHistorial").getElementsByTagName("tbody")[0];

const hoy = new Date().toISOString().split("T")[0];
filtroFecha.setAttribute("max", hoy);

function cargarTrabajadores() {
    const usuariosRef = ref(db, "usuarios");

    filtroTrabajador.innerHTML = `<option value="Todos" selected disabled hidden>Por trabajador</option>
                                  <option value="Todos">Todos</option>`;

    get(usuariosRef).then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach(uid => {
                if (data[uid].nombre) {
                    let option = document.createElement("option");
                    option.value = data[uid].nombre;
                    option.textContent = data[uid].nombre;
                    filtroTrabajador.appendChild(option);
                }
            });
        }
    }).catch(error => console.error("Error obteniendo usuarios:", error));
}

function cargarHistorial() {
    tablaHistorial.innerHTML = "";

    const usuariosRef = ref(db, "usuarios");

    get(usuariosRef).then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            mostrarHistorial(data);
        } else {
            mostrarSinRegistros();
        }
    }).catch(error => console.error("Error obteniendo historial:", error));
}

function mostrarHistorial(data) {
    tablaHistorial.innerHTML = "";
    let registros = [];

    Object.keys(data).forEach(uid => {
        const usuario = data[uid];
        if (usuario.Registro) {
            const nombre = usuario.nombre || "Desconocido";
            const puesto = usuario.puesto || "Sin asignar";

            if (usuario.Registro.Entrada) {
                Object.values(usuario.Registro.Entrada).forEach(entrada => {
                    registros.push({ nombre, puesto, fecha: entrada.Fecha, entrada: entrada.Hora, salida: " - " });
                });
            }

            if (usuario.Registro.Salida) {
                Object.values(usuario.Registro.Salida).forEach(salida => {
                    let filaExistente = registros.find(r => r.nombre === nombre && r.fecha === salida.Fecha);
                    if (filaExistente) {
                        filaExistente.salida = salida.Hora;
                    } else {
                        registros.push({ nombre, puesto, fecha: salida.Fecha, entrada: " - ", salida: salida.Hora });
                    }
                });
            }
        }
    });

    registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (registros.length > 0) {
        registros.forEach(registro => {
            agregarFila(registro.nombre, registro.puesto, registro.fecha, registro.entrada, registro.salida);
        });
    } else {
        mostrarSinRegistros();
    }
}

function agregarFila(trabajador, puesto, fecha, entrada, salida) {
    let fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${trabajador}</td>
        <td>${puesto}</td>
        <td>${fecha}</td>
        <td>${entrada}</td>
        <td>${salida}</td>
    `;
    tablaHistorial.appendChild(fila);
}

function mostrarSinRegistros() {
    tablaHistorial.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; font-weight: bold;">No existen registros</td>
        </tr>
    `;
}

function filtrarHistorial() {
    let trabajadorSeleccionado = filtroTrabajador.value;
    let fechaSeleccionada = filtroFecha.value;

    const usuariosRef = ref(db, "usuarios");

    get(usuariosRef).then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            let registros = [];

            Object.keys(data).forEach(uid => {
                const usuario = data[uid];
                const nombre = usuario.nombre || "Desconocido";
                const puesto = usuario.puesto || "Sin asignar";

                if (!usuario.Registro) return;

                if (usuario.Registro.Entrada) {
                    Object.values(usuario.Registro.Entrada).forEach(entrada => {
                        if ((trabajadorSeleccionado === "Todos" || trabajadorSeleccionado === nombre) &&
                            (!fechaSeleccionada || entrada.Fecha === fechaSeleccionada)) {
                            registros.push({ nombre, puesto, fecha: entrada.Fecha, entrada: entrada.Hora, salida: " - " });
                        }
                    });
                }

                if (usuario.Registro.Salida) {
                    Object.values(usuario.Registro.Salida).forEach(salida => {
                        if ((trabajadorSeleccionado === "Todos" || trabajadorSeleccionado === nombre) &&
                            (!fechaSeleccionada || salida.Fecha === fechaSeleccionada)) {
                            let filaExistente = registros.find(r => r.nombre === nombre && r.fecha === salida.Fecha);
                            if (filaExistente) {
                                filaExistente.salida = salida.Hora;
                            } else {
                                registros.push({ nombre, puesto, fecha: salida.Fecha, entrada: " - ", salida: salida.Hora });
                            }
                        }
                    });
                }
            });

            registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            if (registros.length > 0) {
                tablaHistorial.innerHTML = registros.map(r => `<tr>
                    <td>${r.nombre}</td>
                    <td>${r.puesto}</td>
                    <td>${r.fecha}</td>
                    <td>${r.entrada}</td>
                    <td>${r.salida}</td>
                </tr>`).join("");
            } else {
                mostrarSinRegistros();
            }
        } else {
            mostrarSinRegistros();
        }
    }).catch(error => console.error("Error obteniendo historial filtrado:", error));
}

// Verificar si hay una sesión activa como admin
if (localStorage.getItem("admin") !== "true") {
    alert("Debes iniciar sesión como administrador.");
    window.location.href = "/Aplicacionesmoviles/index.html"; // Redirigir a la página de inicio de sesión
}

window.cerrarSesion = function () {
    localStorage.removeItem("admin"); // Eliminar sesión
    window.location.href = "/Aplicacionesmoviles/index.html"; // Redirigir a la página de inicio de sesión
};


cargarTrabajadores();
cargarHistorial();

window.filtrarHistorial = filtrarHistorial;