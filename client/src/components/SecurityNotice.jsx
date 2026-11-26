// components/SecurityNotice.jsx
// Aviso azul de área restringida que aparece debajo del formulario.

function SecurityNotice() {
  return (
    <div className="aviso-seguridad">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span>
        Área restringida. El acceso a este panel está monitoreado y registrado por seguridad.
      </span>
    </div>
  );
}

export default SecurityNotice;