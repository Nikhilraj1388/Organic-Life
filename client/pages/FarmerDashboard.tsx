import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LayoutDashboard, Package, ShoppingBag, Tag, Store, User, LogOut, Home, Eye } from "lucide-react";

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: "", price: "", category: "", description: "", quantity: "", inStock: true, image: null as File | null
  });
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [promotionForm, setPromotionForm] = useState({
    code: "", discountPercent: "", productId: "", startDate: "", endDate: "", description: ""
  });

  const defaultCategories = [
    { id: 'all', key: 'all', name: 'All' },
    { id: 'fruit', key: 'fruit', name: 'Fruit' },
    { id: 'plants', key: 'plants', name: 'Plants' },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user?.role !== 'farmer') {
      navigate("/dashboard");
      return;
    }
    fetchDashboardData();
    fetchCategories();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, productsRes, ordersRes, promotionsRes] = await Promise.all([
        fetch("/api/farmer/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/farmer/products", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/farmer/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/farmer/promotions", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (promotionsRes.ok) setPromotions(await promotionsRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/farmer/categories", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (!data || data.length === 0) setCategories(defaultCategories as any);
        else setCategories(data);
      } else {
        setCategories(defaultCategories as any);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setCategories(defaultCategories as any);
    }
  };

  const createCategory = async (name?: string) => {
    const catName = (name ?? newCategoryName).trim();
    if (!catName) return toast({ title: 'Category name required', variant: 'destructive' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/farmer/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: catName })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return toast({ title: 'Failed to create category', description: body.error || '' , variant: 'destructive'});
      }
      const data = await res.json();
      await fetchCategories();
      setAddingCategory(false);
      setNewCategoryName('');
      // set selected category to the new key
      const created = data.category as any;
      setProductForm({ ...productForm, category: created.key });
      toast({ title: 'Category created' });
    } catch (err) {
      console.error('Failed to create category', err);
      toast({ title: 'Failed to create category', variant: 'destructive' });
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("price", productForm.price);
      if (productForm.category) formData.append("category", productForm.category);
      formData.append("description", productForm.description);
      formData.append("quantity", productForm.quantity);
      formData.append("inStock", String(productForm.inStock));
      if (productForm.image) formData.append("image", productForm.image);

      const url = editingProduct ? `/api/farmer/products/${editingProduct.id}` : "/api/farmer/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast({ title: "Success", description: editingProduct ? "Product updated" : "Product added (pending approval)" });
        setShowProductDialog(false);
        setProductForm({ name: "", price: "", category: "", description: "", quantity: "", inStock: true, image: null });
        setEditingProduct(null);
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to save product", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/farmer/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: "Success", description: "Product deleted" });
        fetchDashboardData();
      } else {
        toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  const handleToggleStock = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/farmer/products/${id}/toggle-stock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: "Success", description: "Stock status updated" });
        fetchDashboardData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update stock", variant: "destructive" });
    }
  };

  const handleAddPromotion = async () => {
    if (!promotionForm.code || !promotionForm.discountPercent || !promotionForm.startDate || !promotionForm.endDate) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingPromotion ? `/api/farmer/promotions/${editingPromotion.id}` : "/api/farmer/promotions";
      const method = editingPromotion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(promotionForm)
      });

      if (res.ok) {
        toast({ title: "Success", description: editingPromotion ? "Promotion updated" : "Promotion created" });
        setShowPromotionDialog(false);
        setPromotionForm({ code: "", discountPercent: "", productId: "", startDate: "", endDate: "", description: "" });
        setEditingPromotion(null);
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to save promotion", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save promotion", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/farmer/promotions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: "Success", description: "Promotion deleted" });
        fetchDashboardData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete promotion", variant: "destructive" });
    }
  };

  const editProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      quantity: product.quantity || "",
      inStock: product.inStock,
      image: null
    });
    setShowProductDialog(true);
  };

  const editPromotion = (promotion: any) => {
    setEditingPromotion(promotion);
    setPromotionForm({
      code: promotion.code,
      discountPercent: promotion.discountPercent,
      productId: promotion.productId || "",
      startDate: promotion.startDate?.split('T')[0] || "",
      endDate: promotion.endDate?.split('T')[0] || "",
      description: promotion.description || ""
    });
    setShowPromotionDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block fixed h-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-organic-brown flex items-center gap-2">
            <Store className="w-6 h-6" />
            Seller Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        </div>
        
        <nav className="space-y-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className={`w-full justify-start ${activeTab === "overview" ? "bg-organic-brown text-white" : "text-organic-brown hover:bg-organic-cream"}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            className={`w-full justify-start ${activeTab === "products" ? "bg-organic-brown text-white" : "text-organic-brown hover:bg-organic-cream"}`}
            onClick={() => setActiveTab("products")}
          >
            <Package className="w-4 h-4 mr-2" />
            My Products
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className={`w-full justify-start ${activeTab === "orders" ? "bg-organic-brown text-white" : "text-organic-brown hover:bg-organic-cream"}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </Button>
          <Button
            variant={activeTab === "promotions" ? "default" : "ghost"}
            className={`w-full justify-start ${activeTab === "promotions" ? "bg-organic-brown text-white" : "text-organic-brown hover:bg-organic-cream"}`}
            onClick={() => setActiveTab("promotions")}
          >
            <Tag className="w-4 h-4 mr-2" />
            Promotions
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-organic-brown hover:bg-organic-cream"
            onClick={() => window.open("/marketplace", "_blank")}
          >
            <Eye className="w-4 h-4 mr-2" />
            View as Customer
          </Button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2 border-t border-gray-200 pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-organic-brown hover:bg-organic-cream"
            onClick={() => navigate("/dashboard")}
          >
            <User className="w-4 h-4 mr-2" />
            My Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-organic-brown">Seller Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your products, orders, and promotions</p>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProducts || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeProducts || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.totalRevenue?.toFixed(2) || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your store efficiently</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button onClick={() => { setActiveTab("products"); setShowProductDialog(true); }} className="bg-organic-brown hover:bg-organic-black">
                    <Package className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button onClick={() => { setActiveTab("promotions"); setShowPromotionDialog(true); }} variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Create Promotion
                  </Button>
                  <Button onClick={() => setActiveTab("orders")} variant="outline">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Products</CardTitle>
                  <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingProduct(null); setProductForm({ name: "", price: "", category: "", description: "", quantity: "", inStock: true, image: null }); }} className="bg-organic-brown hover:bg-organic-black">Add Product</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>Fill in the product details</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name *</Label>
                          <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                        </div>
                        <div>
                          <Label>Price *</Label>
                          <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <select value={productForm.category} onChange={(e) => {
                            const v = e.target.value;
                            if (v === '__new__') {
                              setAddingCategory(true);
                              setProductForm({ ...productForm, category: '' });
                            } else {
                              setAddingCategory(false);
                              setProductForm({ ...productForm, category: v });
                            }
                          }} className="w-full h-10 px-3 border rounded-md">
                            <option value="">Select category</option>
                            {categories.map((cat: any) => <option key={cat.id} value={cat.key}>{cat.name}</option>)}
                            <option value="__new__">+ Add new category...</option>
                          </select>
                          {addingCategory && (
                            <div className="mt-2 flex gap-2">
                              <Input placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                              <Button onClick={() => createCategory()}>Create</Button>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input type="number" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                        </div>
                        <div>
                          <Label>Image</Label>
                          <Input type="file" accept="image/*" onChange={(e) => setProductForm({ ...productForm, image: e.target.files?.[0] || null })} />
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" checked={productForm.inStock} onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })} className="mr-2" />
                          <Label>In Stock</Label>
                        </div>
                        <Button onClick={handleAddProduct} disabled={isLoading} className="w-full bg-organic-brown hover:bg-organic-black">
                          {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? "default" : "secondary"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.status === 'approved' ? "default" : product.status === 'pending' ? "secondary" : "destructive"}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editProduct(product)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleToggleStock(product.id)}>Toggle</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => {
                        const orderTotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0) || 0;
                        return (
                          <TableRow key={order.id || order._id}>
                            <TableCell className="font-mono text-xs">
                              #{(order._id || order.id)?.slice(-8)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.userId?.name || "Customer"}</div>
                                <div className="text-xs text-gray-500">{order.userId?.email || "N/A"}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.items?.map((item: any, idx: number) => (
                                  <div key={idx}>{item.name} x{item.qty}</div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">₹{orderTotal.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={order.paymentMethod === 'cod' ? 'secondary' : 'default'}>
                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'delivered' ? 'default' :
                                order.status === 'cancelled' ? 'destructive' : 'secondary'
                              }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Promotions Tab */}
          {activeTab === "promotions" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Promotions</CardTitle>
                  <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingPromotion(null); setPromotionForm({ code: "", discountPercent: "", productId: "", startDate: "", endDate: "", description: "" }); }} className="bg-organic-brown hover:bg-organic-black">Add Promotion</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingPromotion ? "Edit Promotion" : "Create Promotion"}</DialogTitle>
                        <DialogDescription>Set up a discount offer</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Promo Code *</Label>
                          <Input value={promotionForm.code} onChange={(e) => setPromotionForm({ ...promotionForm, code: e.target.value })} disabled={!!editingPromotion} />
                        </div>
                        <div>
                          <Label>Discount % *</Label>
                          <Input type="number" min="0" max="100" value={promotionForm.discountPercent} onChange={(e) => setPromotionForm({ ...promotionForm, discountPercent: e.target.value })} />
                        </div>
                        <div>
                          <Label>Product (Optional)</Label>
                          <select value={promotionForm.productId} onChange={(e) => setPromotionForm({ ...promotionForm, productId: e.target.value })} className="w-full h-10 px-3 border rounded-md">
                            <option value="">All Products</option>
                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label>Start Date *</Label>
                          <Input type="date" value={promotionForm.startDate} onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })} />
                        </div>
                        <div>
                          <Label>End Date *</Label>
                          <Input type="date" value={promotionForm.endDate} onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })} />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input value={promotionForm.description} onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })} />
                        </div>
                        <Button onClick={handleAddPromotion} disabled={isLoading} className="w-full bg-organic-brown hover:bg-organic-black">
                          {isLoading ? "Saving..." : editingPromotion ? "Update Promotion" : "Create Promotion"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono">{promo.code}</TableCell>
                        <TableCell>{promo.discountPercent}%</TableCell>
                        <TableCell>{promo.productId ? products.find(p => p.id === promo.productId)?.name || "N/A" : "All"}</TableCell>
                        <TableCell>{new Date(promo.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(promo.endDate).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={promo.status === 'active' ? "default" : "secondary"}>{promo.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editPromotion(promo)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePromotion(promo.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
