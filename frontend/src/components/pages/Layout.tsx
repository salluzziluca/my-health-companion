import React from 'react';
import PrimarySearchAppBar from '../PrimarySearchAppBar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <PrimarySearchAppBar />
      <Outlet /> {/* Aquí se renderiza cada página según la ruta */}
    </>
  );
}
