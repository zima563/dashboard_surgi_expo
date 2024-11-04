import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Products = () => {
  const [visible, setVisible] = useState(false)
  const [visibleAdd, setVisibleAdd] = useState(false)
  const [visibleDelete, setVisibleDelete] = useState(false)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [brief, setBrief] = useState('')
  const [catId, setCatId] = useState('')

  const [imgCover, setImgCover] = useState(null)
  const [imgCoverI, setImgCoverI] = useState(null)
  const [images, setImages] = useState([])
  const [imagesI, setImagesI] = useState([])
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem("authToken");

  const fetchCategoeries = async () => {
    try {
      const res = await axios.get('https://api.surgi-expo.com/api/categories/sub')
      setCategories(res.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategoeries()
  }, [])


  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://api.surgi-expo.com/api/products?limit=100')
      setProducts(res.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProduct = async (id) => {
    setLoading(true)
    try {
      if (id) {
        const res = await axios.get(`https://api.surgi-expo.com/api/products/${id}`)
        const productData = res.data
        setSelectedProduct(productData)
        setImgCover(productData.imgCover)
        setImages(productData.images || [])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct(id)
  }, [id])

  // Handle single file selection for imgCover
  const handleImgCoverChange = (e) => {
    const file = e.target.files[0]
    setImgCover(URL.createObjectURL(file))
    setImgCoverI(file);
    setSelectedProduct((prev) => ({
      ...prev,
      imgCover: file,
    }))
  }

  // Handle multiple file selection for images
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    const imageUrls = files.map((file) => URL.createObjectURL(file))
    setImages([...images, ...imageUrls])
    setImagesI([...imagesI, ...files])
    setSelectedProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }))
  }

  // Remove selected image from imgCover
  const removeImgCover = () => {
    setImgCover(null)
    setSelectedProduct((prev) => ({ ...prev, imgCover: null }))
  }

  // Remove a specific image from images array
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setSelectedProduct((prev) => {
      const newImageFiles = (prev.images || []).filter((_, i) => i !== index)
      return { ...prev, images: newImageFiles }
    })
  }

  // Save changes to the selected product
  const handleSaveChanges = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('title', selectedProduct.title)
    formData.append('description', selectedProduct.description)
    formData.append('brief', selectedProduct.brief)

    // Only add imgCover if it has been changed
    if (selectedProduct.imgCover instanceof File) {
      formData.append('imgCover', selectedProduct.imgCover)
    }

    // Append new images if they have been changed
    selectedProduct.images &&
      selectedProduct.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image)
        }
      })

    try {
      await axios.put(`https://api.surgi-expo.com/api/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization:
            `Bearer ${token}`,
        },
      })
      fetchProducts() // Refresh product list after update
      alert('produuct updated successfully')
      setVisible(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('brief', brief)
    formData.append("category", catId)

    if (imgCoverI instanceof File) {
      formData.append('imgCover', imgCoverI)
    }

    imagesI.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image)
      }
    })

    try {
      await axios.post('https://api.surgi-expo.com/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      fetchProducts() // Refresh product list after adding
      setVisibleAdd(false) // Close the add modal
      alert('Product added successfully')
      // Reset fields
      setTitle('')
      setDescription('')
      setBrief('')
      setImgCover(null)
      setImages([])
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await axios.delete(`https://api.surgi-expo.com/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchProducts() // Refresh product list after deletion
      setVisibleDelete(false) // Close delete modal
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setVisible(false);
    setSelectedProduct(null);
    setImgCover(null);
    setImages([]);
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={() => setVisibleAdd(true)}>
          Add Product
        </CButton>
      </div>
      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Title</CTableHeaderCell>
            <CTableHeaderCell scope="col">Description</CTableHeaderCell>
            <CTableHeaderCell scope="col">Brief</CTableHeaderCell>
            <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {products.map((pro, index) => (
            <CTableRow key={index}>
              <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
              <CTableDataCell>{pro.title}</CTableDataCell>
              <CTableDataCell>{pro.description}</CTableDataCell>
              <CTableDataCell>{pro.brief}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="primary"
                  style={{ width: '80px' }}
                  onClick={() => {
                    setId(pro.id)
                    fetchProduct(pro.id)
                    setVisible(true)
                  }}
                >
                  Edit
                </CButton>
                <CButton color="danger" style={{ width: '80px' }} className="mt-2" onClick={() => {
                  setId(pro.id)
                  setVisibleDelete(true) // Open delete confirmation modal
                }}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visibleAdd} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>Add Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Product Title</CFormLabel>
              <CFormInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="mb-3">
              <CFormLabel>Description</CFormLabel>
              <CFormTextarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></CFormTextarea>
            </div>
            <div className="mb-3">
              <CFormLabel>Brief</CFormLabel>
              <CFormTextarea
                rows={3}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              ></CFormTextarea>
            </div>

            <div className="mb-3">
              <CFormSelect aria-label="Default select example" value={catId || ""} onChange={(e) => setCatId(e.target.value)}>
                <option>Open this select menu</option>
                {categories.map((cat, index) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </CFormSelect>
            </div>


            {/* Display imgCover */}
            <div className="mb-3">
              <CFormLabel>Image Cover</CFormLabel>
              <CInputGroup>
                <CFormInput type="file" onChange={handleImgCoverChange} />
                {imgCover && (
                  <div className="position-relative">
                    <img
                      src={imgCover}
                      alt="Cover"
                      style={{ width: '100px', marginLeft: '10px' }}
                    />
                    <span
                      onClick={removeImgCover}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        cursor: 'pointer',
                        color: 'red',
                      }}
                    >
                      &times;
                    </span>
                  </div>
                )}
              </CInputGroup>
            </div>

            {/* Display images */}
            <div className="mb-3">
              <CFormLabel>Additional Images</CFormLabel>
              <CInputGroup>
                <CFormInput type="file" multiple onChange={handleImagesChange} />
                <div className="d-flex flex-wrap mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="position-relative" style={{ marginRight: '10px' }}>
                      <img src={image} alt={`img-${index}`} style={{ width: '100px' }} />
                      <span
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          cursor: 'pointer',
                          color: 'red',
                        }}
                      >
                        &times;
                      </span>
                    </div>
                  ))}
                </div>
              </CInputGroup>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setVisibleAdd(false)
              setImgCover(null)
              setImages([])
            }}
          >
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddProduct} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Add Product'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={visible} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>Edit Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" /> {/* Loading indicator */}
            </div>
          ) : selectedProduct ? (
            <CForm>
              <div className="mb-3">
                <CFormLabel>Product Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={selectedProduct.title || ''}
                  onChange={(e) =>
                    setSelectedProduct((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={selectedProduct.description || ''}
                  onChange={(e) =>
                    setSelectedProduct((prev) => ({ ...prev, description: e.target.value }))
                  }
                ></CFormTextarea>
              </div>
              <div className="mb-3">
                <CFormLabel>Brief</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={selectedProduct.brief || ''}
                  onChange={(e) =>
                    setSelectedProduct((prev) => ({ ...prev, brief: e.target.value }))
                  }
                ></CFormTextarea>
              </div>

              <div className="mb-3">
                <CFormSelect aria-label="Default select example" value={selectedProduct?.category?._id || ""} onChange={(e) => setSelectedProduct((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))}>
                  <option>{selectedProduct?.category?.name}</option>
                  {categories.map((cat, index) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </CFormSelect>
              </div>

              {/* Display imgCover */}
              <div className="mb-3">
                <CFormLabel>Image Cover</CFormLabel>
                <CInputGroup>
                  <CFormInput type="file" onChange={handleImgCoverChange} />
                  {imgCover && (
                    <div className="position-relative">
                      <img
                        src={imgCover}
                        alt="Cover"
                        style={{ width: '100px', marginLeft: '10px' }}
                      />
                      <span
                        onClick={removeImgCover}
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          cursor: 'pointer',
                          color: 'red',
                        }}
                      >
                        &times;
                      </span>
                    </div>
                  )}
                </CInputGroup>
              </div>

              {/* Display images */}
              <div className="mb-3">
                <CFormLabel>Additional Images</CFormLabel>
                <CInputGroup>
                  <CFormInput type="file" multiple onChange={handleImagesChange} />
                  <div className="d-flex flex-wrap mt-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="position-relative"
                        style={{ marginRight: '10px' }}
                      >
                        <img src={image} alt={`img-${index}`} style={{ width: '100px' }} />
                        <span
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            cursor: 'pointer',
                            color: 'red',
                          }}
                        >
                          &times;
                        </span>
                      </div>
                    ))}
                  </div>
                </CInputGroup>
              </div>
            </CForm>
          ) : (
            <p>No product data found.</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveChanges} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Save Changes'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={visibleDelete} onClose={() => setVisibleDelete(false)}>
        <CModalHeader>
          <CModalTitle>Delete Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this product?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleDelete(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Delete'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Products;
