// components/InputField.jsx
// Campo de texto reutilizable con label.
// Props:
//   id        → identificador del input (string)
//   label     → texto de la etiqueta visible (string)
//   type      → tipo de input: "text", "email", etc. (string, default "text")
//   placeholder → texto de ayuda dentro del input (string)
//   value     → valor controlado desde el padre (string)
//   onChange  → función que actualiza el valor en el padre (function)
//   required  → si el campo es obligatorio (bool)
//   autoComplete → valor de autocomplete del input (string)

function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

export default InputField;