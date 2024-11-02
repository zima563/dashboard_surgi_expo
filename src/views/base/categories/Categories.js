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

const Categories = () => {
  const [visible, setVisible] = useState(false)
  const [visibleAdd, setVisibleAdd] = useState(false)
  const [visibleDelete, setVisibleDelete] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await axios.get('https://api.surgi-expo.com/api/categories?limit=100')
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategory = async (id) => {
    setLoading(true)
    try {
      if (id) {
        const res = await axios.get(`https://api.surgi-expo.com/api/Categories/${id}`)
        const categoryData = res.data
        setSelectedCategory(categoryData)
        setImage(`https://media.surgi-expo.com/${categoryData.image}`)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory(id)
  }, [id])

  // Handle single file selection for imgCover
  const handleImgChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setSelectedCategory((prev) => ({
      ...prev,
      image: file,
    }))
  }

  // Remove selected image from imgCover
  const removeImg = () => {
    setImage(null)
    setSelectedCategory((prev) => ({ ...prev, image: null }))
  }

  // Save changes to the selected product
  const handleSaveChanges = async () => {
    const formData = new FormData()
    formData.append('name', selectedCategory.name)
    formData.append('description', selectedCategory.description)

    // Only add imgCover if it has been changed
    if (selectedCategory.image instanceof File) {
      formData.append('img', selectedCategory.image)
    }

    try {
      await axios.put(`https://api.surgi-expo.com/api/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzAzYjMzMDE1NTc5NjcxZTI2OTZlMDAiLCJpYXQiOjE3MjgyOTU3MzV9.OdaYfcKfBv-KeLZy8ap1PJiI6AYVlkxzxRHNI-msUSE',
        },
      })
      fetchCategories() // Refresh product list after update
      alert('Category updated successfully')
      setVisible(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error updating Category:', error)
    }
  }

  const handleAddCategory = async () => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)

    if (image instanceof File) {
      formData.append('img', image)
      console.log();
    }

    try {
      await axios.post('https://api.surgi-expo.com/api/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzAzYjMzMDE1NTc5NjcxZTI2OTZlMDAiLCJpYXQiOjE3MjgyOTU3MzV9.OdaYfcKfBv-KeLZy8ap1PJiI6AYVlkxzxRHNI-msUSE',
        },
      })
      fetchCategories() // Refresh product list after adding
      setVisibleAdd(false) // Close the add modal
      alert('Category added successfully')
      // Reset fields
      setName('')
      setDescription('')
      setImage(null)
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await axios.delete(`https://api.surgi-expo.com/api/categories/${id}`, {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzAzYjMzMDE1NTc5NjcxZTI2OTZlMDAiLCJpYXQiOjE3MjgyOTU3MzV9.OdaYfcKfBv-KeLZy8ap1PJiI6AYVlkxzxRHNI-msUSE',
        },
      })
      fetchCategories() // Refresh product list after deletion
      setVisibleDelete(false) // Close delete modal
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={() => setVisibleAdd(true)}>
          Add Category
        </CButton>
      </div>
      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">name</CTableHeaderCell>
            <CTableHeaderCell scope="col">Description</CTableHeaderCell>
            <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {categories.map((cat, index) => (
            <CTableRow key={index}>
              <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
              <CTableDataCell>{cat.name}</CTableDataCell>
              <CTableDataCell>{cat.description}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="primary"
                  style={{ width: '80px' }}
                  className='me-2'
                  onClick={() => {
                    setId(cat._id)
                    fetchCategory(cat._id)
                    setVisible(true)
                  }}
                >
                  Edit
                </CButton>
                <CButton
                  color="danger"
                  style={{ width: '80px' }}
                  onClick={() => {
                    setId(cat._id)
                    setVisibleDelete(true) // Open delete confirmation modal
                  }}
                >
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)}>
        <CModalHeader>
          <CModalTitle>Add Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Category Name</CFormLabel>
              <CFormInput type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <CFormLabel>Description</CFormLabel>
              <CFormTextarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></CFormTextarea>
            </div>

            {/* Display imgCover */}
            <div className="mb-3">
              <CFormLabel>Image</CFormLabel>
              <CInputGroup>
                <CFormInput type="file" onChange={handleImgChange} />
                {image && (
                  <div className="position-relative">
                    <img src={image} alt="Cover" style={{ width: '100px', marginLeft: '10px' }} />
                    <span
                      onClick={removeImg}
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
          <CButton color="primary" onClick={handleAddCategory} disabled={loading}>
            Add Category
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" /> {/* Loading indicator */}
            </div>
          ) : selectedCategory? (
            <CForm>
              <div className="mb-3">
                <CFormLabel>Category Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={selectedCategory.name || ''}
                  onChange={(e) =>
                    setSelectedCategory((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={selectedCategory.description || ''}
                  onChange={(e) =>
                    setSelectedCategory((prev) => ({ ...prev, description: e.target.value }))
                  }
                ></CFormTextarea>
              </div>

              {/* Display imgCover */}
              <div className="mb-3">
                <CFormLabel>Image</CFormLabel>
                <CInputGroup>
                  <CFormInput type="file" onChange={handleImgChange} />
                  {image && (
                    <div className="position-relative">
                      <img
                        src={image}
                        alt="Cover"
                        style={{ width: '100px', marginLeft: '10px' }}
                      />
                      <span
                        onClick={removeImg}
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

              
            </CForm>
          ) : (
            <p>No category data available</p>
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
        <CModalBody>Are you sure you want to delete this product?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleDelete(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Categories
