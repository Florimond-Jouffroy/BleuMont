import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Catalogue from './pages/Catalogue';
import Produit from './pages/Produit';

const root = document.getElementById('shop-root');
const urls = JSON.parse(root?.dataset.urls ?? '{}');

export default function ShopApp() {
    return (
        <BrowserRouter basename="/boutique">
            <Routes>
                <Route index element={<Catalogue urls={urls} />} />
                <Route path="produit/:slug" element={<Produit urls={urls} />} />
            </Routes>
        </BrowserRouter>
    );
}
