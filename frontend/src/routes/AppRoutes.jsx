import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Menu from "../pages/public/Menu";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import OrderConfirmation from "../pages/public/OrderConfirmation";
import ManageFoods from "../pages/admin/ManageFoods";
import ManageCategories from "../pages/admin/ManageCategories";
import ManageOrders from "../pages/admin/ManageOrders";
import Dashboard from "../pages/admin/Dashboard";
import Profile from "../pages/protected/Profile";
import OrderHistory from "../pages/protected/OrderHistory";
import NotFound from '../pages/public/NotFound';
import Home from '../pages/public/Home';
import FoodDetails from '../pages/public/FoodDetails';
import CheckoutVerify from '../pages/public/CheckoutVerify';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/food/:id" element={<FoodDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/checkout/verify" element={<CheckoutVerify />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/foods" element={<ManageFoods />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;