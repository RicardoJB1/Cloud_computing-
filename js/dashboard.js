console.log("JS cargado correctamente");

// Configuración de Supabase
const SUPABASE_URL = "https://sdpdtlatzvlhrtmeexit.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGR0bGF0enZsaHJ0bWVleGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDQ5NTIsImV4cCI6MjA3MDA4MDk1Mn0.D1Iiqo5EVRLAAd2jcYHUo5I59VzPZnbfsd8jg4RNYwU";
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Agregar estudiante
async function agregarEstudiante() {
  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const clase = document.getElementById("clase").value;

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    alert("No estás autenticado.");
    return;
  }

  const { error } = await client.from("estudiantes").insert({
    nombre,
    correo,
    clase,
    user_id: user.id,
  });

  if (error) {
    alert("Error al agregar: " + error.message);
  } else {
    alert("Estudiante agregado");
    cargarEstudiantes();
  }
}

// Cargar estudiantes
async function cargarEstudiantes() {
  const { data, error } = await client
    .from("estudiantes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert("Error al cargar estudiantes: " + error.message);
    return;
  }

  const lista = document.getElementById("lista-estudiantes");
  lista.innerHTML = "";

  data.forEach((est) => {
    const item = document.createElement("li");
    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    item.innerHTML = `
      <span><strong>${est.nombre}</strong> (${est.clase}) - ${est.correo}</span>
      <div>
        <button class="btn btn-warning btn-sm me-2" onclick="editarEstudiante(${est.id}, '${est.nombre}', '${est.correo}', '${est.clase}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="eliminarEstudiante(${est.id})">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    lista.appendChild(item);
  });
}


// Subir archivo
async function subirArchivo() {
  const archivoInput = document.getElementById("archivo");
  const archivo = archivoInput.files[0];

  if (!archivo) {
    alert("Selecciona un archivo primero.");
    return;
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    alert("Sesión no válida.");
    return;
  }

  const nombreRuta = `${user.id}/${archivo.name}`;
  const { data, error } = await client.storage
    .from("tareas")
    .upload(nombreRuta, archivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    alert("Error al subir: " + error.message);
  } else {
    alert("Archivo subido correctamente.");
    listarArchivos();
  }
}

// Listar archivos
async function listarArchivos() {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    alert("Sesión no válida.");
    return;
  }

  const { data, error } = await client.storage
    .from("tareas")
    .list(`${user.id}`, { limit: 20 });

  const lista = document.getElementById("lista-archivos");
  lista.innerHTML = "";

  if (error) {
    lista.innerHTML = "<li>Error al listar archivos</li>";
    return;
  }

  data.forEach(async (archivo) => {
    const { data: signedUrlData, error: signedUrlError } = await client.storage
      .from("tareas")
      .createSignedUrl(`${user.id}/${archivo.name}`, 60);

    if (signedUrlError) {
      console.error("Error al generar URL firmada:", signedUrlError.message);
      return;
    }

    const publicUrl = signedUrlData.signedUrl;
    const item = document.createElement("li");

    const esImagen = archivo.name.match(/\.(jpg|jpeg|png|gif)$/i);
    const esPDF = archivo.name.match(/\.pdf$/i);

    if (esImagen) {
      item.innerHTML = `
        <strong>${archivo.name}</strong><br>
        <a href="${publicUrl}" target="_blank">
          <img src="${publicUrl}" width="150" style="border:1px solid #ccc; margin:5px;" />
        </a>
      `;
    } else if (esPDF) {
      item.innerHTML = `
        <strong>${archivo.name}</strong><br>
        <a href="${publicUrl}" target="_blank">Ver PDF</a>
      `;
    } else {
      item.innerHTML = `<a href="${publicUrl}" target="_blank">${archivo.name}</a>`;
    }

    lista.appendChild(item);
  });
}
//funcion para eliminar estudiante
async function eliminarEstudiante(id) {
  if (!confirm("¿Seguro que quieres eliminar este estudiante?")) return;

  const { error } = await client
    .from("estudiantes")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error al eliminar: " + error.message);
  } else {
    alert("Estudiante eliminado");
    cargarEstudiantes();
  }
}

//funcion para actualisar estudiante 
let estudianteEditandoId = null;

function editarEstudiante(id, nombre, correo, clase) {
  document.getElementById("nombre").value = nombre;
  document.getElementById("correo").value = correo;
  document.getElementById("clase").value = clase;
  estudianteEditandoId = id;

  const btn = document.querySelector("button[onclick='agregarEstudiante()']");
  btn.innerHTML = '<i class="bi bi-check-circle"></i> Actualizar';
  btn.onclick = actualizarEstudiante;
}

async function actualizarEstudiante() {
  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const clase = document.getElementById("clase").value;

  const { error } = await client
    .from("estudiantes")
    .update({ nombre, correo, clase })
    .eq("id", estudianteEditandoId);

  if (error) {
    alert("Error al actualizar: " + error.message);
  } else {
    alert("Estudiante actualizado");
    estudianteEditandoId = null;

    // Restaurar botón a "Agregar"
    const btn = document.querySelector("button[onclick='actualizarEstudiante()']");
    btn.innerHTML = '<i class="bi bi-plus-circle"></i> Agregar';
    btn.onclick = agregarEstudiante;

    // Limpiar formulario y recargar lista
    document.getElementById("nombre").value = "";
    document.getElementById("correo").value = "";
    document.getElementById("clase").value = "";
    cargarEstudiantes();
  }
}


// Cerrar sesión
async function cerrarSesion() {
  const { error } = await client.auth.signOut();

  if (error) {
    alert("Error al cerrar sesión: " + error.message);
  } else {
    localStorage.removeItem("token");
    alert("Sesión cerrada.");
    window.location.href = "index.html";
  }
}


// Ejecutar funciones al cargar
cargarEstudiantes();
listarArchivos();
