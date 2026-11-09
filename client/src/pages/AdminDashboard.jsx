export default function AdminDashboard() {
    return (
        <section className="seccion-admin activa">
            <div className="stats-cards">
                <div className="stat-card-admin">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        {/* SVG Icon */}
                    </div>
                    <div className="stat-info">
                        <h3>124</h3>
                        <p>Recetas Publicadas</p>
                    </div>
                </div>
                {/* Agregar el resto de tarjetas de estadísticas aquí */}
            </div>
            
            <div className="card-tabla">
                <div className="card-header">
                    <h2>Últimas recetas enviadas por usuarios</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Receta</th>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="td-receta">
                                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&q=70&fm=webp" alt="Pizza" /> 
                                    Pizza Casera
                                </div>
                            </td>
                            <td>Daniel Pérez</td>
                            <td>Hace 2 horas</td>
                            <td><span className="badge badge-pendiente">Pendiente</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
}