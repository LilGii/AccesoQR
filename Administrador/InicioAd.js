// Verificar si hay una sesión activa como admin
if (localStorage.getItem("admin") !== "true") {
    alert("Debes iniciar sesión como administrador.");
    window.location.href = "https://acceso-qr.vercel.app/index.html"; // Redirigir a la página de inicio de sesión
}

window.cerrarSesion = function () {
    localStorage.removeItem("admin"); // Eliminar sesión
    window.location.href = "https://acceso-qr.vercel.app/index.html"; // Redirigir a la página de inicio de sesión
};
