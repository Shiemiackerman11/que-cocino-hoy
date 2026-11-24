// client/src/utils/generarRecetaPdf.js
import { jsPDF } from 'jspdf';

function nombreSeguro(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'receta';
}

function descargarArchivo(contenido, nombre, tipo) {
  const archivo = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

async function calcularSHA256(bytes) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SHA-256 requiere un contexto seguro (HTTPS o localhost).');
  }

  const resultado = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resultado), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

/** Genera y descarga un PDF de receta y un archivo de comprobación SHA-256. */
export async function generarRecetaPdf(receta) {
  if (!receta?.titulo) {
    throw new Error('No se recibieron los datos de la receta.');
  }

  const pdf = new jsPDF();
  const margen = 20;
  const anchoTexto = pdf.internal.pageSize.getWidth() - margen * 2;
  const altoPagina = pdf.internal.pageSize.getHeight();
  const interlineado = 6;
  let y = 20;

  // Escribe texto ajustándolo al ancho y agrega páginas si hace falta.
  const escribir = (texto, opciones = {}) => {
    const { tamano = 11, espacioDespues = 2 } = opciones;
    pdf.setFontSize(tamano);
    const lineas = pdf.splitTextToSize(String(texto), anchoTexto);

    for (const linea of lineas) {
      if (y + interlineado > altoPagina - margen) {
        pdf.addPage();
        y = margen;
      }
      pdf.text(linea, margen, y);
      y += interlineado;
    }
    y += espacioDespues;
  };

  escribir(receta.titulo, { tamano: 20, espacioDespues: 4 });
  escribir(receta.categoria ?? 'Receta', { tamano: 12 });
  escribir(receta.descripcionLarga ?? receta.descripcion ?? '');
  escribir(`Tiempo: ${receta.tiempo ?? 'No especificado'} min`);
  escribir(`Complejidad: ${receta.complejidad ?? 'No especificada'}`, { espacioDespues: 6 });

  escribir('Ingredientes', { tamano: 15, espacioDespues: 2 });
  for (const ingrediente of receta.ingredientes ?? []) {
    escribir(`- ${ingrediente.cantidad} ${ingrediente.nombre}`);
  }

  y += 4;
  escribir('Preparación', { tamano: 15, espacioDespues: 2 });
  for (const [indice, paso] of (receta.pasos ?? []).entries()) {
    escribir(`${indice + 1}. ${paso.titulo}: ${paso.texto}`, { espacioDespues: 3 });
  }

  // Obtiene los bytes exactos que se guardarán en el PDF y calcula su huella.
  const bytesPdf = pdf.output('arraybuffer');
  const hash = await calcularSHA256(bytesPdf);
  const nombre = nombreSeguro(receta.titulo);

  descargarArchivo(bytesPdf, `${nombre}.pdf`, 'application/pdf');
  descargarArchivo(`${hash}  ${nombre}.pdf\n`, `${nombre}.sha256`, 'text/plain');

  return hash;
}

