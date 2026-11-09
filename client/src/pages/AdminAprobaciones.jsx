export default function AdminAprobaciones() {
    return (
        <section className="seccion-admin activa">
            <div className="card-tabla">
                <div className="card-header">
                    <h2>Recetas Pendientes de Revisión</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Receta</th>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="td-receta">
                                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&q=70&fm=webp" alt="Pizza Casera" /> 
                                    Pizza Casera con Masa Madre
                                </div>
                            </td>
                            <td>Daniel Pérez</td>
                            <td>Hace 2 horas</td>
                            <td>
                                <div className="acciones">
                                    <button className="btn-icono btn-aprobar" title="Aprobar" onClick={() => alert('Receta aprobada y publicada')}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    </button>
                                    <button className="btn-icono btn-rechazar" title="Rechazar" onClick={() => alert('Se abrirá un modal para pedir el motivo del rechazo')}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                    <button className="btn-icono btn-editar" title="Ver detalles" onClick={() => alert('Abriendo vista previa de la receta completa')}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="td-receta">
                                    <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=70&fm=webp" alt="Ensalada Vegana" /> 
                                    Ensalada Vegana de Quinoa
                                </div>
                            </td>
                            <td>María Gómez</td>
                            <td>Hace 5 horas</td>
                            <td>
                                <div className="acciones">
                                    <button className="btn-icono btn-aprobar" onClick={() => alert('Receta aprobada')}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    </button>
                                    <button className="btn-icono btn-rechazar" onClick={() => alert('Receta rechazada')}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                    <button className="btn-icono btn-editar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
}