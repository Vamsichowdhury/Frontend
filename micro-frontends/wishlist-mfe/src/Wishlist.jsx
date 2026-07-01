// Wishlist.jsx — the federated EXPOSED entry point (./Wishlist).
//
// Notice what's NOT here: <BrowserRouter>.
// Only ONE router can exist per app, and the host owns it (or our
// bootstrap.jsx provides one for standalone dev). This file just
// declares the MFE's internal sub-routes — they get matched against
// the URL via the existing router context.
//
// This is the "MFE owns its sub-routes" pattern: the host doesn't
// need to know that /wishlist/:productId exists. It says "you handle
// anything under /wishlist/*" (via the splat route in host App.jsx)
// and the rest is up to us.

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WishlistList from './WishlistList.jsx';
import WishlistDetail from './WishlistDetail.jsx';
import './Wishlist.css';

export default function Wishlist() {
  return (
    <Routes>
      {/* index = matches the parent path exactly (e.g. /wishlist) */}
      <Route index element={<WishlistList />} />
      {/* :productId is a dynamic segment readable via useParams() */}
      <Route path=":productId" element={<WishlistDetail />} />
    </Routes>
  );
}
