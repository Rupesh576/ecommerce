import { useState } from 'react';
import api from '../api/client';

export default function ProductModal({ product, onClose, onSaved }) {
  const isEditing = Boolean(product?._id);

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [stock, setStock] = useState(product?.stock ?? '');
  const [category, setCategory] = useState(product?.category || 'general');
  const [image, setImage] = useState(product?.image || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pasteActive, setPasteActive] = useState(false);

  // Helper to read File into base64 data URL
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please provide a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5MB).');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 1. Handle file input change
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // 2. Handle clipboard paste
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let foundImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleFile(file);
          foundImage = true;
          e.preventDefault();
          break;
        }
      }
    }

    if (!foundImage) {
      // Check if text was pasted that is an image URL
      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://'))) {
        setImage(pastedText.trim());
      }
    }
  };

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Name is required');
    if (!description.trim()) return setError('Description is required');
    if (price === '' || Number(price) < 0) return setError('Valid price is required');
    if (stock === '' || Number(stock) < 0) return setError('Valid stock is required');

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      category: category.trim() || 'general',
      image,
    };

    try {
      if (isEditing) {
        const { data } = await api.put(`/products/${product._id}`, payload);
        onSaved(data);
      } else {
        const { data } = await api.post('/products', payload);
        onSaved(data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        onPaste={handlePaste}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="status-message error">{error}</div>}

          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Gaming Mouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                min="0"
                required
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="Electronics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              required
              placeholder="Describe the product details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* IMAGE EDITING SECTION */}
          <div className="form-group">
            <label>Product Image</label>

            {image ? (
              <div className="image-preview-wrapper">
                <img src={image} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => setImage('')}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div
                className={`paste-drop-zone ${pasteActive ? 'active' : ''}`}
                tabIndex="0"
                onFocus={() => setPasteActive(true)}
                onBlur={() => setPasteActive(false)}
              >
                <div className="paste-drop-icon">📋</div>
                <div className="paste-drop-text">
                  <strong>Click here and press Ctrl+V / Cmd+V</strong>
                  <span>to paste any copied image directly</span>
                </div>
              </div>
            )}

            <div className="image-upload-options">
              <div className="file-upload-wrapper">
                <label className="file-upload-btn">
                  📁 Choose File from Computer
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="url-upload-wrapper">
                <input
                  type="text"
                  placeholder="Or paste an image web URL (https://...)"
                  value={image.startsWith('http') ? image : ''}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
