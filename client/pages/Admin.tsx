import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAuthToken } from "../lib/utils";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import Modal from "../components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  image?: string;
  description?: string;
}

interface Analytics {
  totalEarnings: number;
  data: any[];
}

export default function Admin() {
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";
  const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const authHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  // keep both categoryKey (selected option value) and category (display name) so we can map cleanly
  const [newProduct, setNewProduct] = useState<{name: string, price: number, categoryKey: string, category: string, inStock: boolean, image: File | null, description: string}>({ name: "", price: 0, categoryKey: "", category: "", inStock: true, image: null, description: "" });
  const [newCategory, setNewCategory] = useState<string>("");
  const [addingNewCategory, setAddingNewCategory] = useState<boolean>(false);
  const [newProductPublished, setNewProductPublished] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [removeImage, setRemoveImage] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [analyticsFilters, setAnalyticsFilters] = useState<{type: string, year: string, month: string}>({ type: "earnings", year: "", month: "" });
  // removed productPublishedFilter UI per request
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'publish' | 'unpublish' | null>(null);
  // Confirmation modal for deletes
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category' | 'category-image'; id: string; name?: string } | null>(null);

  const editCardRef = useRef<HTMLDivElement | null>(null);
  const editIdRef = useRef<string | null>(null);
  const [categories, setCategories] = useState<Array<{id: string, name: string, key: string, image?: string, order?: number}>>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // On first mount, capture edit query param (deep link)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId) editIdRef.current = editId;
    } catch (err) {
      // ignore
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
  const data = await res.json();
  const mapped = data.map((c: any) => ({ id: c.id ?? c._id ?? String(c.key ?? c.name), name: c.name, key: c.key, image: c.image, order: c.order }));
  // If API returned empty categories, try to derive from products as a fallback
  if ((!mapped || mapped.length === 0) && products && products.length > 0) {
    const derived = Array.from(new Map(products.map((p) => {
      const key = (p as any).categoryKey ?? (p.category ? String(p.category).trim().toLowerCase() : String(p.category));
      return [key, { id: String(key), key, name: p.category }];
    })).values());
    setCategories(derived as any);
  } else {
    setCategories(mapped);
  }
      }
    } catch (err) {
      console.warn('Failed to fetch categories', err);
    } finally {
      setCatLoading(false);
    }
  };

  // Helper: derive categories from products list
  const deriveCategoriesFromProducts = (prods: Product[]) => {
    const map = new Map<string, { id: string; key: string; name: string }>();
    prods.forEach((p) => {
      const key = (p as any).categoryKey ?? (p.category ? String(p.category).trim().toLowerCase() : String(p.category));
      if (!key) return;
      if (!map.has(key)) map.set(key, { id: String(key), key, name: p.category });
    });
    return Array.from(map.values());
  };

  const fetchProducts = async (published: 'all' | 'published' | 'unpublished' = 'all') => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/products?published=${published}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched products:", data);
        setProducts(data);
        setSelectedIds([]);
        // If categories are missing, derive them from products so filters and admin selects populate
        if ((!categories || categories.length === 0) && data && data.length > 0) {
          const derived = deriveCategoriesFromProducts(data as Product[]);
          if (derived.length > 0) setCategories(derived as any);
        }
        // If deep-link edit id is present, try to find the product and open it
        if (editIdRef.current) {
          const pid = editIdRef.current;
          const prod = data.find((p: any) => (p.id ?? p._id ?? '') === pid || p._id === pid || p.id === pid);
          if (prod) {
            // small delay to ensure UI is ready
            setTimeout(() => handleEditProduct(prod), 50);
            // clear so we don't repeatedly trigger
            editIdRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (analyticsFilters.type) params.append('type', analyticsFilters.type);
      if (analyticsFilters.year) params.append('year', analyticsFilters.year);
      if (analyticsFilters.month) params.append('month', analyticsFilters.month);
  const response = await fetch(`${API_BASE}/api/admin/analytics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      // Normalize response
      const normalized: Order[] = (data || []).map((o: any) => ({
        id: o._id || o.id,
        createdAt: o.createdAt,
        customerName: o.userId?.name || o.userId?.email || o.userId || 'Customer',
        total: o.total || 0,
        status: o.status || 'pending',
        items: (o.items || []).map((it: any) => ({
          productId: it.productId,
          name: it.name,
          qty: it.qty,
          price: it.price,
        })),
      }));
      setOrders(normalized);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.warn('Failed to update order status');
        return;
      }
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (selectedOrder && selectedOrder.id === id) setSelectedOrder({ ...selectedOrder, status });
      return data;
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', String(userPage));
      params.append('limit', String(userLimit));
      if (userRoleFilter) params.append('role', userRoleFilter);
      if (userStatusFilter) params.append('status', userStatusFilter);
      if (userSearch) params.append('search', userSearch);

      const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setUsers((data.users || []).map((u: any) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      })));
      setUserTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/promotions`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setPromotions((data || []).map((p: any) => ({
        id: p._id || p.id,
        code: p.code,
        discountPercent: p.discountPercent,
        productId: p.productId,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
      })));
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/inventory`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setInventory(data || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const fetchReports = async (type: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${type}`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setReports({ type, data });
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };

  const handleProductSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
  // If admin added a new category, use that value; otherwise prefer the categoryKey (canonical id), fallback to display name
  const categoryToSend = addingNewCategory ? newCategory.trim() : (newProduct.categoryKey || newProduct.category);
      formData.append("category", categoryToSend);
      formData.append("inStock", newProduct.inStock.toString());
      formData.append("description", newProduct.description);
      formData.append("published", newProductPublished ? 'true' : 'false');
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
      if ((selectedProduct as any)?.image && removeImage) {
        formData.append('removeImage', 'true');
      }

  const method = selectedProduct ? 'PUT' : 'POST';
  const targetId = selectedProduct ? (selectedProduct.id ?? selectedProduct._id) : null;
  const url = targetId ? `/api/admin/products/${targetId}` : '/api/admin/products';

      const response = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });
      if (response.ok) {
        fetchProducts();
  setNewProduct({ name: "", price: 0, categoryKey: "", category: "", inStock: true, image: null, description: "" });
        setNewCategory("");
        setAddingNewCategory(false);
        setSelectedProduct(null);
        try {
          const cat = categoryToSend || 'Uncategorized';
          toast({ title: 'Product saved', description: `${newProduct.name} saved under "${cat}"` });
        } catch (err) {
          console.warn('Toast failed', err);
        }
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    // try to map product.category (likely a display name) back to a categoryKey
    const found = categories.find((c) => c.name === product.category || c.key === product.category);
    setNewProduct({
      name: product.name,
      price: product.price,
      categoryKey: found ? found.key : (product.category ?? ""),
      category: product.category ?? "",
      inStock: product.inStock,
      image: null, // new file input - don't prefill
      description: product.description || "",
    });
    setNewProductPublished((product as any).published ?? true);
    setRemoveImage(false);
    // scroll the edit card into view
    setTimeout(() => {
      if (editCardRef.current) {
        editCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // focus the name input inside the card if present
        const input = editCardRef.current.querySelector<HTMLInputElement>('#name');
        input?.focus();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    setSelectedProduct(null);
    setNewProduct({ name: "", price: 0, categoryKey: "", category: "", inStock: true, image: null, description: "" });
    setNewCategory("");
    setAddingNewCategory(false);
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` }
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const showDeleteConfirm = (type: 'product' | 'category' | 'category-image', id: string, name?: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return setDeleteConfirmOpen(false);
    const { type, id } = deleteTarget;
    try {
      if (type === 'product') {
        const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` } });
        if (res.ok) fetchProducts();
      } else if (type === 'category') {
        const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` } });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          toast({ title: 'Failed to delete category', description: body.error || '' });
        } else {
          toast({ title: 'Category deleted' });
          fetchCategories();
        }
      } else if (type === 'category-image') {
        const res = await fetch(`${API_BASE}/api/admin/categories/${id}/image`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` } });
        if (!res.ok) {
          toast({ title: 'Failed to delete image' });
        } else {
          toast({ title: 'Image deleted' });
          fetchCategories();
        }
      }
    } catch (err) {
      console.error('Delete failed', err);
      toast({ title: 'Delete failed' });
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return [...prev, id];
      return prev.filter((p) => p !== id);
    });
  };

  const handleBulkAction = (action: 'publish' | 'unpublish') => {
    setPendingAction(action);
    setModalOpen(true);
  };

  const confirmBulkAction = async () => {
    if (!pendingAction || selectedIds.length === 0) {
      setModalOpen(false);
      return;
    }
    try {
      const publishedBool = pendingAction === 'publish';
      const res = await fetch(`${API_BASE}/api/admin/products/bulk`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedIds, published: publishedBool }),
      });
      if (!res.ok) throw new Error('Bulk update failed');
      setModalOpen(false);
      setPendingAction(null);
      fetchProducts();
    } catch (err) {
      console.error('Bulk update failed', err);
      setModalOpen(false);
    }
  };

  const uploadCategoryImage = async (id: string, file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/${id}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      toast({ title: 'Image uploaded' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to upload category image', err);
      toast({ title: 'Failed to upload image' });
    }
  };

  const reorderCategories = async (newOrder: string[]) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
        body: JSON.stringify({ ids: newOrder }),
      });
      if (!res.ok) throw new Error('Reorder failed');
      toast({ title: 'Categories reordered' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to reorder categories', err);
      toast({ title: 'Failed to reorder categories' });
    }
  };

  const deleteCategoryImage = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/${id}/image`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Image deleted' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category image', err);
      toast({ title: 'Failed to delete image' });
    }
  };

  // --- Orders management (mock data) ---
  type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  interface OrderItem {
    productId: string;
    name: string;
    qty: number;
    price: number;
  }

  interface Order {
    id: string;
    createdAt: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
  }

  interface UserRow {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: "user" | "farmer" | "admin";
    status: "active" | "suspended";
    createdAt: string;
  }

  interface Promotion {
    id: string;
    code: string;
    discountPercent: number;
    productId?: string;
    startDate: string;
    endDate: string;
    status: string;
  }

  interface InventoryItem {
    productId: string;
    name: string;
    quantity: number;
    inStock: boolean;
    lowStock: boolean;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(20);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
      fetchAnalytics();
      fetchCategories();
      fetchOrders();
      fetchUsers();
      fetchPromotions();
      fetchInventory();
    }
  }, [user, analyticsFilters, userPage, userLimit, userRoleFilter, userStatusFilter, userSearch]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const startEditCategory = (cat: {id: string, name: string}) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const saveEditCategory = async () => {
    if (!editingCatId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/${editingCatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
        body: JSON.stringify({ name: editingCatName.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast({ title: 'Category updated', description: `${data.category.name}` });
      setEditingCatId(null);
      setEditingCatName('');
      fetchCategories();
    } catch (err) {
      console.error('Failed to update category', err);
      toast({ title: 'Failed to update category' });
    }
  };

  const createCategory = async () => {
    const name = newCatName.trim();
    if (!name) {
      toast({ title: 'Category name required' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: 'Failed to create category', description: body.error || '' });
        return;
      }
      toast({ title: 'Category created' });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      console.error('Failed to create category', err);
      toast({ title: 'Failed to create category' });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: 'Failed to delete category', description: body.error || '' });
        return;
      }
      toast({ title: 'Category deleted' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
      toast({ title: 'Failed to delete category' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {/* Filter removed per UI suggestion */}
          <Card ref={editCardRef}>
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</CardTitle>
              </div>
              <div className="flex-1 max-w-sm">
                <Label htmlFor="select-product" className="sr-only">Edit existing product</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProduct ? (selectedProduct.id ?? selectedProduct._id ?? undefined) : undefined}
                    onValueChange={(val) => {
                      if (val === "__new__") return handleCancelEdit();
                      const prod = products.find((p) => (p.id ?? p._id ?? '') === val);
                      if (prod) handleEditProduct(prod);
                    }}
                  >
                    <SelectTrigger aria-label="Select product to edit">
                      <SelectValue placeholder="-- Create new product --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">-- Create new product --</SelectItem>
                      {products.map((p) => (
                        <SelectItem key={p.id ?? p._id} value={p.id ?? p._id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>Clear</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  {/* derive category options from canonical categories API */}
                  <select
                    id="category"
                    value={addingNewCategory ? "__new__" : newProduct.categoryKey}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__new__") {
                        setAddingNewCategory(true);
                        setNewCategory("");
                        setNewProduct({ ...newProduct, categoryKey: "", category: "" });
                      } else {
                        setAddingNewCategory(false);
                        setNewCategory("");
                        // value is category key; find its display name
                        const chosen = categories.find((c) => c.key === v);
                        setNewProduct({ ...newProduct, categoryKey: v, category: chosen ? chosen.name : v });
                      }
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                    <option value="__new__">+ Add new category...</option>
                  </select>

                  {addingNewCategory && (
                    <div className="mt-2">
                      <Input
                        id="new-category"
                        placeholder="Enter new category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <div className="text-sm text-gray-500 mt-1">Type a new category name and it will be saved with the product.</div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inStock">In Stock</Label>
                  <input
                    id="inStock"
                    type="checkbox"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files ? e.target.files[0] : null })}
                  />
                  {selectedProduct?.image && !newProduct.image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={selectedProduct.image.startsWith('/') ? `${API_BASE}${selectedProduct.image}` : selectedProduct.image} alt="preview" className="w-24 h-24 object-cover rounded" />
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} /> Remove image
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="published">Published</Label>
                  <input
                    id="published"
                    type="checkbox"
                    checked={newProductPublished}
                    onChange={(e) => setNewProductPublished(e.target.checked)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProductSubmit}>{selectedProduct ? "Update Product" : "Add Product"}</Button>
                {selectedProduct && <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleBulkAction('publish')} disabled={selectedIds.length===0}>Publish</Button>
                      <Button variant="outline" onClick={() => handleBulkAction('unpublish')} disabled={selectedIds.length===0}>Unpublish</Button>
                    </div>
                    <div className="text-sm text-gray-600">{selectedIds.length} selected</div>
                  </div>

                  <Table>
                <TableHeader>
                  <TableRow>
                        <TableHead style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={products.length>0 && selectedIds.length===products.length}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                if (checked) setSelectedIds(products.map((p) => p.id ?? p._id ?? ''));
                                else setSelectedIds([]);
                              }}
                          />
                        </TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(product.id ?? product._id ?? '')}
                                onChange={(e) => toggleSelect(product.id ?? product._id ?? '', e.target.checked)}
                            />
                          </TableCell>
                          <TableCell>
                            {product.image ? (
                              <img
                                src={product.image.startsWith("/") ? `${API_BASE}${product.image}` : product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No image</div>
                            )}
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                      <TableCell>{inrFormatter.format(product.price)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge variant={product.inStock ? "default" : "destructive"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                          <label className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(product as any).published ?? true}
                              onChange={async (e) => {
                                try {
                                  const form = new URLSearchParams();
                                  form.append('published', e.target.checked ? 'true' : 'false');
                                  const pid = product.id ?? product._id;
                                  const res = await fetch(`${API_BASE}/api/admin/products/${pid}`, {
                                    method: 'PUT',
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
                                    },
                                    body: form,
                                  });
                                  if (res.ok) fetchProducts();
                                } catch (err) {
                                  console.error('Failed to update published status', err);
                                }
                              }}
                            />
                            <span className="text-sm text-gray-600">Published</span>
                          </label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showDeleteConfirm('product', product.id ?? product._id ?? '', product.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Input
                  placeholder="Search by name, email, phone"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <Select value={userRoleFilter} onValueChange={(val) => setUserRoleFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="user">Customer</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userStatusFilter} onValueChange={(val) => setUserStatusFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchUsers}>Refresh</Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell>
                          <Badge variant={u.status === 'active' ? 'default' : 'destructive'}>{u.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => {
                              const newStatus = u.status === 'active' ? 'suspended' : 'active';
                              fetch(`${API_BASE}/api/admin/users/${u.id}/status`, {
                                method: 'PUT',
                                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus }),
                              }).then(() => fetchUsers());
                            }}>
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              if (!window.confirm(`Delete user ${u.name}?`)) return;
                              fetch(`${API_BASE}/api/admin/users/${u.id}`, {
                                method: 'DELETE',
                                headers: authHeaders(),
                              }).then(() => fetchUsers());
                            }}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  Showing {(userPage - 1) * userLimit + 1} - {Math.min(userPage * userLimit, userTotal)} of {userTotal}
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage === 1}>Prev</Button>
                  <span>Page {userPage}</span>
                  <Button onClick={() => setUserPage(userPage + 1)} disabled={userPage * userLimit >= userTotal}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input placeholder="Code" value={""} onChange={() => {}} disabled />
                <Input placeholder="Discount %" value={""} onChange={() => {}} disabled />
                <Input placeholder="Product ID" value={""} onChange={() => {}} disabled />
              </div>
              <p className="text-sm text-gray-500">Promotion creation UI coming soon.</p>
              <div className="overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.code}</TableCell>
                        <TableCell>{p.discountPercent}%</TableCell>
                        <TableCell>{p.productId}</TableCell>
                        <TableCell>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{p.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Low Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.lowStock ? <Badge variant="destructive">Low</Badge> : <Badge variant="default">OK</Badge>}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => {
                            const qty = prompt('Enter new quantity', String(item.quantity));
                            if (!qty) return;
                            const parsed = parseInt(qty, 10);
                            if (Number.isNaN(parsed)) return;
                            fetch(`${API_BASE}/api/admin/inventory/${item.productId}`, {
                              method: 'PUT',
                              headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                              body: JSON.stringify({ quantity: parsed }),
                            }).then(() => fetchInventory());
                          }}>
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Button onClick={() => fetchReports('sales')}>Sales</Button>
                <Button onClick={() => fetchReports('orders')}>Orders</Button>
                <Button onClick={() => fetchReports('products')}>Products</Button>
                <Button onClick={() => fetchReports('users')}>Users</Button>
              </div>
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">{JSON.stringify(reports, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.id}</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{inrFormatter.format(o.total)}</TableCell>
                        <TableCell>
                          <Badge variant={o.status === 'delivered' ? 'default' : o.status === 'cancelled' ? 'destructive' : 'secondary'}>{o.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => openOrder(o)}>View</Button>
                            <select className="p-1 border rounded" value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}>
                              <option value="pending">pending</option>
                              <option value="processing">processing</option>
                              <option value="shipped">shipped</option>
                              <option value="delivered">delivered</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Order details modal */}
          <Modal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} title={selectedOrder ? `Order ${selectedOrder.id}` : 'Order'}
            actions={
              <>
                <Button variant="outline" onClick={() => setOrderModalOpen(false)}>Close</Button>
                {selectedOrder && selectedOrder.status !== 'delivered' && (
                  <Button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}>Mark Delivered</Button>
                )}
              </>
            }
          >
            {selectedOrder ? (
              <div>
                <div className="mb-2"><strong>Customer:</strong> {selectedOrder.customerName}</div>
                <div className="mb-2"><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div className="mb-2"><strong>Status:</strong> {selectedOrder.status}</div>
                <div className="mb-4"><strong>Items:</strong>
                  <ul className="list-disc ml-6 mt-2">
                    {selectedOrder.items.map((it) => (
                      <li key={it.productId}>{it.name} x{it.qty} — {inrFormatter.format(it.price)}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-lg font-bold">Total: {inrFormatter.format(selectedOrder.total)}</div>
              </div>
            ) : (
              <div>No order selected</div>
            )}
          </Modal>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={analyticsFilters.type}
                    onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, type: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="earnings">Earnings</option>
                    <option value="customers">Customers</option>
                    <option value="products">Products</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={analyticsFilters.year}
                    onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, year: e.target.value })}
                    placeholder="e.g. 2023"
                  />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    value={analyticsFilters.month}
                    onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, month: e.target.value })}
                    placeholder="e.g. 01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {analytics && (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.totalEarnings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {analyticsFilters.type === 'earnings' ? 'Earnings' : analyticsFilters.type === 'customers' ? 'Customer Growth' : 'Popular Products'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <div style={{ width: '100%', height: '100%' }}>
                      {analyticsFilters.type === 'earnings' && (
                        <BarChart data={analytics.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="earnings" fill="#8884d8" />
                        </BarChart>
                      )}
                      {analyticsFilters.type === 'customers' && (
                        <LineChart data={analytics.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="customers" stroke="#82ca9d" />
                        </LineChart>
                      )}
                      {analyticsFilters.type === 'products' && (
                        <PieChart>
                          <Pie
                            data={analytics.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="orders"
                          >
                            {analytics.data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      )}
                    </div>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings panel for admin configurations.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input placeholder="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <Button onClick={createCategory}>Create</Button>
              </div>

              <div>
                  {catLoading ? (
                  <div>Loading categories...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((cat, idx, arr) => (
                        <TableRow key={cat.id}
                          draggable
                          onDragStart={(e) => { e.dataTransfer?.setData('text/plain', cat.id); }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const dragId = e.dataTransfer?.getData('text/plain');
                            if (!dragId) return;
                            const fromIndex = arr.findIndex(a => a.id === dragId);
                            const toIndex = idx;
                            if (fromIndex === -1) return;
                            const newArr = arr.slice();
                            const [moved] = newArr.splice(fromIndex, 1);
                            newArr.splice(toIndex, 0, moved);
                            reorderCategories(newArr.map((n) => n.id));
                          }}
                        >
                          <TableCell>
                            {cat.image ? (
                              <img src={cat.image.startsWith('/') ? `${API_BASE}${cat.image}` : cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <img src="/placeholder.svg" alt="placeholder" className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <label className="cursor-pointer inline-flex items-center gap-2 px-2 py-1 bg-organic-cream rounded text-sm">
                                <input type="file" className="hidden" onChange={(e) => uploadCategoryImage(cat.id, e.target.files ? e.target.files[0] : null)} />
                                Upload
                              </label>
                              {cat.image && (
                                <Button size="sm" variant="destructive" onClick={() => showDeleteConfirm('category-image', cat.id, cat.name)}>Delete Image</Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {editingCatId === cat.id ? (
                              <Input value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} />
                            ) : (
                              cat.name
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{cat.order ?? idx}</span>
                              <div className="flex flex-col">
                                <Button size="sm" onClick={() => {
                                  // move up
                                  if (idx === 0) return;
                                  const newArr = arr.slice();
                                  const tmp = newArr[idx-1];
                                  newArr[idx-1] = newArr[idx];
                                  newArr[idx] = tmp;
                                  reorderCategories(newArr.map((n) => n.id));
                                }}>↑</Button>
                                <Button size="sm" onClick={() => {
                                  // move down
                                  if (idx === arr.length - 1) return;
                                  const newArr = arr.slice();
                                  const tmp = newArr[idx+1];
                                  newArr[idx+1] = newArr[idx];
                                  newArr[idx] = tmp;
                                  reorderCategories(newArr.map((n) => n.id));
                                }}>↓</Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {editingCatId === cat.id ? (
                                <>
                                  <Button size="sm" onClick={saveEditCategory}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={() => { setEditingCatId(null); setEditingCatName(''); }}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startEditCategory(cat)}>Edit</Button>
                                  <Button size="sm" variant="destructive" onClick={() => showDeleteConfirm('category', cat.id, cat.name)}>Delete</Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={pendingAction === 'publish' ? 'Confirm Publish' : 'Confirm Unpublish'}
        actions={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmBulkAction}>{pendingAction === 'publish' ? 'Publish' : 'Unpublish'}</Button>
          </>
        }
      >
        <p>Are you sure you want to {pendingAction} {selectedIds.length} product(s)?</p>
      </Modal>
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title={`Confirm delete`}
        actions={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete {deleteTarget?.name ?? deleteTarget?.id}?</p>
      </Modal>
    </div>
  );
}