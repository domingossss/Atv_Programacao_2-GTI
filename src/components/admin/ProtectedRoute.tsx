import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = localStorage.getItem('josemegahair_isAuthenticated') === 'true';
  const token = localStorage.getItem('adminToken');
  const keepLoggedIn = localStorage.getItem('josemegahair_keepLoggedIn') === 'true';
  const loginTimestamp = localStorage.getItem('josemegahair_loginTimestamp');

  // Verificação de autenticação e token
  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se não estiver marcado "manter conectado", verifica se a sessão expirou (24 horas)
  if (!keepLoggedIn && loginTimestamp) {
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    const currentTime = Date.now();
    const elapsedTime = currentTime - parseInt(loginTimestamp);

    if (elapsedTime > sessionDuration) {
      // Sessão expirada, limpa os dados e redireciona para login
      localStorage.removeItem('josemegahair_isAuthenticated');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('josemegahair_loginTimestamp');
      localStorage.removeItem('josemegahair_keepLoggedIn');
      return <Navigate to="/admin/login" replace />;
    }
  }

  return <>{children}</>;
}
