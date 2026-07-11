import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';

const root        = document.getElementById('admin-root');
const userEmail   = root?.dataset.userEmail ?? '';
const logoutUrl   = root?.dataset.logoutUrl ?? '/deconnexion';
const permissions = JSON.parse(root?.dataset.permissions ?? '{}');
const urls        = JSON.parse(root?.dataset.urls        ?? '{}');

export default function AdminApp() {
    return (
        <BrowserRouter basename="/admin">
            <Routes>
                <Route element={<AdminLayout userEmail={userEmail} logoutUrl={logoutUrl} />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<UsersList permissions={permissions} urls={urls} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
