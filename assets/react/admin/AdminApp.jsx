import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ArticleEditor from './pages/ArticleEditor';
import ArticlesList from './pages/ArticlesList';
import CategoryManager from './pages/CategoryManager';
import InvoicesList from './pages/InvoicesList';
import OrderDetail from './pages/OrderDetail';
import OrdersList from './pages/OrdersList';
import Dashboard from './pages/Dashboard';
import ProductCategoryManager from './pages/ProductCategoryManager';
import ProductEditor from './pages/ProductEditor';
import ProductsList from './pages/ProductsList';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import UsersList from './pages/UsersList';
import ShippingMethods from './pages/ShippingMethods';

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
                    <Route path="dashboard" element={<Dashboard urls={urls} />} />
                    <Route path="utilisateurs" element={<UsersList permissions={permissions} urls={urls} />} />
                    <Route path="articles" element={<ArticlesList permissions={permissions} urls={urls} />} />
                    <Route path="articles/nouveau" element={<ArticleEditor permissions={permissions} urls={urls} />} />
                    <Route path="articles/:id/modifier" element={<ArticleEditor permissions={permissions} urls={urls} />} />
                    <Route path="categories" element={<CategoryManager permissions={permissions} urls={urls} />} />
                    <Route path="commandes" element={<OrdersList permissions={permissions} urls={urls} />} />
                    <Route path="commandes/:id" element={<OrderDetail permissions={permissions} />} />
                    <Route path="factures" element={<InvoicesList urls={urls} />} />
                    <Route path="produits" element={<ProductsList permissions={permissions} urls={urls} />} />
                    <Route path="produits/nouveau" element={<ProductEditor permissions={permissions} urls={urls} />} />
                    <Route path="produits/:id/modifier" element={<ProductEditor permissions={permissions} urls={urls} />} />
                    <Route path="categories-produits" element={<ProductCategoryManager permissions={permissions} urls={urls} />} />
                    <Route path="medias" element={<MediaLibrary permissions={permissions} urls={urls} />} />
                    <Route path="livraison" element={<ShippingMethods urls={urls} />} />
                    <Route path="parametres" element={<Settings urls={urls} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
