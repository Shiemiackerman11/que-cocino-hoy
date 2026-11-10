// components/PasswordField.jsx
// Campo de contraseña con botón para mostrar/ocultar el texto.
// Props:
//   id        → identificador del input (string)
//   label     → texto de la etiqueta visible (string)
//   placeholder → texto de ayuda (string)
//   value     → valor controlado desde el padre (string)
//   onChange  → función que actualiza el valor en el padre (function)

import { useState } from 'react';

function PasswordField({ id, label, placeholder, value, onChange }) {
  // Estado local: ¿se está mostrando la contraseña como texto?
  const [visible, setVisible] = useState(false);

  return (
    <div className="campo campo-password">
      <label htmlFor={id}>{label}</label>

      <input
        type={visible ? 'text' : 'password'}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="current-password"
        required
      />

      {/* Botón ojo: alterna entre mostrar y ocultar */}
      <button
        type="button"
        className="toggle-password"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? (
          /* Ícono ojo tachado (contraseña visible → clic para ocultar) */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* Ícono ojo abierto (contraseña oculta → clic para ver) */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default PasswordField;