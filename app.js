
const API_URL = "http://localhost:3000/api/productos";

const tabla = document.getElementById("tabla-datos");
const mensaje = document.getElementById("mensaje");
const totalProductos = document.getElementById("total-productos");
const precioPromedio = document.getElementById("precio-promedio");
const productoCaro = document.getElementById("producto-caro");
const botonActualizar = document.getElementById("btn-actualizar");

let grafica = null;

async function cargarProductos() {
    mensaje.textContent = "Cargando productos...";
    botonActualizar.disabled = true;

    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const productos = await respuesta.json();

        if (!Array.isArray(productos)) {
            throw new Error("La API no devolvió una lista de productos.");
        }

        mostrarProductos(productos);
        actualizarResumen(productos);
        actualizarGrafica(productos);

        mensaje.textContent =
            `Se cargaron ${productos.length} productos correctamente.`;
    } catch (error) {
        console.error("Error al consultar la API:", error);

        tabla.innerHTML = `
            <tr>
                <td colspan="3">
                    No se pudieron cargar los productos.
                </td>
            </tr>
        `;

        mensaje.textContent =
            "No se pudo conectar con la API. Verifica que el servidor esté funcionando.";

        totalProductos.textContent = "0";
        precioPromedio.textContent = "$0.00";
        productoCaro.textContent = "--";

        if (grafica) {
            grafica.destroy();
            grafica = null;
        }
    } finally {
        botonActualizar.disabled = false;
    }
}

function mostrarProductos(productos) {
    tabla.innerHTML = "";

    if (productos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="3">No hay productos registrados.</td>
            </tr>
        `;
        return;
    }

    productos.forEach(producto => {
        const fila = document.createElement("tr");

        const celdaId = document.createElement("td");
        celdaId.textContent = producto.id;

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = producto.nombre;

        const celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = formatearPrecio(producto.precio);

        fila.append(celdaId, celdaNombre, celdaPrecio);
        tabla.appendChild(fila);
    });
}

function actualizarResumen(productos) {
    totalProductos.textContent = productos.length;

    if (productos.length === 0) {
        precioPromedio.textContent = "$0.00";
        productoCaro.textContent = "--";
        return;
    }

    const suma = productos.reduce(
        (acumulado, producto) =>
            acumulado + Number(producto.precio || 0),
        0
    );

    const promedio = suma / productos.length;

    const masCaro = productos.reduce((anterior, actual) =>
        Number(actual.precio) > Number(anterior.precio)
            ? actual
            : anterior
    );

    precioPromedio.textContent = formatearPrecio(promedio);
    productoCaro.textContent = masCaro.nombre;
}

function actualizarGrafica(productos) {
    const elemento = document.getElementById("miGrafica");

    if (grafica) {
        grafica.destroy();
    }

    grafica = new Chart(elemento, {
        type: "bar",
        data: {
            labels: productos.map(producto => producto.nombre),
            datasets: [{
                label: "Precio del producto (MXN)",
                data: productos.map(producto => Number(producto.precio)),
                backgroundColor: "#3b82f6",
                borderColor: "#1d4ed8",
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Precio en pesos mexicanos"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Productos"
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function formatearPrecio(precio) {
    return Number(precio).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });
}

botonActualizar.addEventListener("click", cargarProductos);

cargarProductos();
