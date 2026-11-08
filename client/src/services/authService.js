// client/src/services/authService.js

export const loginUsuario = async (email, password) => {
  // Simulamos una petición al servidor con un retraso de 1 segundo
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@test.com' && password === '12345678') {
        const data = {
          token: 'token-falso-de-prueba-12345',
          usuario: { id: 1, nombre: 'Daniel', email: email, rol: 'admin' }
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        resolve(data);
      } else {
        reject(new Error('Correo o contraseña incorrectos.'));
      }
    }, 1000);
  });
};