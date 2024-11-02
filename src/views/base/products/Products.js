import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
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
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [brief, setBrief] = useState('')

  const [imgCover, setImgCover] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

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
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzAzYjMzMDE1NTc5NjcxZTI2OTZlMDAiLCJpYXQiOjE3MjgyOTU3MzV9.OdaYfcKfBv-KeLZy8ap1PJiI6AYVlkxzxRHNI-msUSE',
        },
      })
      fetchProducts() // Refresh product list after update
      alert('produuct updated successfully')
      setVisible(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleAddProduct = async () => {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('brief', brief)

    if (imgCover instanceof File) {
      formData.append('imgCover', imgCover)
    }

    images.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image)
      }
    })

    try {
      await axios.post('https://api.surgi-expo.com/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer YOUR_TOKEN_HERE',
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
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await axios.delete(`https://api.surgi-expo.com/api/products/${id}`, {
        headers: {
          Authorization: 'Bearer YOUR_TOKEN_HERE',
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
                    setId(pro._id)
                    fetchProduct(pro._id)
                    setVisible(true)
                  }}
                >
                  Edit
                </CButton>
                <CButton color="danger" style={{ width: '80px' }} className="mt-2" onClick={() => {
                    setId(pro._id)
                    setVisibleDelete(true) // Open delete confirmation modal
                  }}>
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)}>
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
            }}
          >
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddProduct} disabled={loading}>
            Add Product
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={visible} onClose={() => setVisible(false)}>
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
            <p>No product data available</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setVisible(false)
              setId(null)
            }}
          >
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveChanges} disabled={loading}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={visibleDelete} onClose={() => setVisibleDelete(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this product?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleDelete(false)}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Products
