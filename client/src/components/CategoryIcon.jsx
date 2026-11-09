// client/src/components/CategoryIcon.jsx
const ICONOS = {
  entradas: (
    <>
      <path d="M3 11h18" />
      <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
      <path d="M9 15h6" />
    </>
  ),
  'platos-fuertes': (
    <>
      <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
      <path d="M12 3v8" />
      <circle cx="12" cy="6" r="2" />
    </>
  ),
  postres: (
    <>
      <path d="M6 10h12l-1.5 9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2L6 10z" />
      <path d="M8 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      <path d="M12 2v3" />
    </>
  ),
  bebidas: (
    <>
      <path d="M8 2h8l1 6a6 6 0 0 1-10 0l1-6z" />
      <path d="M12 14v6" />
      <path d="M8 20h8" />
      <path d="M6 8h12" />
    </>
  ),
  vegetarianos: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </>
  ),
  especiales: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
};

export default function CategoryIcon({ id }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS[id] ?? ICONOS.especiales}
    </svg>
  );
}
