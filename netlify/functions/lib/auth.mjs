import jwt from 'jsonwebtoken';

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no está configurada');
  return process.env.JWT_SECRET;
}

// Genera un JWT firmado (HS256) con identidad del usuario y exp (2 horas).
export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), nombre: user.nombre, correo: user.correo, rol: user.rol },
    secret(),
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

// Valida firma + expiración del header Authorization: Bearer <token>.
// Devuelve { user } o { error } (el llamador responde 401).
export function authenticate(req) {
  const key = secret();
  const header = req.headers.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return { error: 'Token requerido' };
  try {
    return { user: jwt.verify(token, key, { algorithms: ['HS256'] }) };
  } catch (e) {
    return { error: e.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido' };
  }
}
