import { useState, useEffect } from 'react';
import { getFoodsRequest, createFoodRequest, updateFoodRequest, deleteFoodRequest } from '../../api/foodApi';
import { getCategoriesRequest } from '../../api/categoryApi';
import { formatCurrency } from '../../utils/formatCurrency';
import '../../styles/forms.css';
import '../../styles/admin.css';

const initialFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
};

const ManageFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        getFoodsRequest({ page, limit: 10 }),
        getCategoriesRequest(),
      ]);
      setFoods(foodsRes.data.data.foods);
      setPagination(foodsRes.data.pagination);
      setCategories(categoriesRes.data.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const startEdit = (food) => {
    setEditingId(food._id);
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category._id,
    });
    setImageFile(null);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setImageFile(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      if (editingId) {
        await updateFoodRequest(editingId, submitData);
      } else {
        await createFoodRequest(submitData);
      }
      cancelEdit();
      await loadData();
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors?.length) {
        setFormError(backendErrors.map((e) => e.message).join(', '));
      } else {
        setFormError(err.response?.data?.message || 'Failed to save food item.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item? This cannot be undone.')) return;
    try {
      await deleteFoodRequest(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete food item.');
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      await updateFoodRequest(food._id, { isAvailable: !food.isAvailable });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability.');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-page">
      <h1>Manage Foods</h1>

      <h2>{editingId ? 'Edit Food' : 'Add New Food'}</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="price">Price</label>
          <input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="image">Image {editingId && '(leave blank to keep current)'}</label>
          <input id="image" name="image" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <button type="submit" disabled={isSubmitting} className="form-submit-btn">
          {isSubmitting ? 'Saving...' : editingId ? 'Update Food' : 'Add Food'}
        </button>
        {editingId && (
          <button type="button" onClick={cancelEdit} className="admin-btn">
            Cancel
          </button>
        )}
      </form>

      <h2>Existing Foods ({pagination?.total ?? foods.length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food._id}>
                <td>{food.name}</td>
                <td>{food.category.name}</td>
                <td>{formatCurrency(food.price)}</td>
                <td>
                  <button
                    onClick={() => handleToggleAvailability(food)}
                    className={`admin-badge ${food.isAvailable ? 'admin-badge--available' : 'admin-badge--unavailable'}`}
                  >
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td>
                  <button onClick={() => startEdit(food)} className="admin-btn">Edit</button>{' '}
                  <button onClick={() => handleDelete(food._id)} className="admin-btn admin-btn--danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="admin-btn">
            Previous
          </button>
          <span style={{ alignSelf: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages} className="admin-btn">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageFoods;