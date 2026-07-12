import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ArticleEditor from './pages/ArticleEditor';
import ArticlesList from './pages/ArticlesList';
import CategoryManager from './pages/CategoryManager';
import OrderDetail from './pages/OrderDetail';
import OrdersList from './pages/OrdersList';
import Dashboard from './pages/Dashboard';
import ProductCategoryManager from './pages/ProductCategoryManager';
import ProductEditor from './pages/ProductEditor';
import ProductsList from './pages/ProductsList';
import MediaLibrary from './pages/MediaLibrary';
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
                    <Route path="articles" element={<ArticlesList permissions={permissions} urls={urls} />} />
                    <Route path="articles/new" element={<ArticleEditor permissions={permissions} urls={urls} />} />
                    <Route path="articles/:id/edit" element={<ArticleEditor permissions={permissions} urls={urls} />} />
                    <Route path="categories" element={<CategoryManager permissions={permissions} urls={urls} />} />
                    <Route path="orders" element={<OrdersList permissions={permissions} urls={urls} />} />
                    <Route path="orders/:id" element={<OrderDetail permissions={permissions} />} />
                    <Route path="products" element={<ProductsList permissions={permissions} urls={urls} />} />
                    <Route path="products/new" element={<ProductEditor permissions={permissions} urls={urls} />} />
                    <Route path="products/:id/edit" element={<ProductEditor permissions={permissions} urls={urls} />} />
                    <Route path="product-categories" element={<ProductCategoryManager permissions={permissions} urls={urls} />} />
                    <Route path="media" element={<MediaLibrary permissions={permissions} urls={urls} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
