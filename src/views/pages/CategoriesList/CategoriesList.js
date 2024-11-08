import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import React from 'react'

function CategoriesList() {
  return (
    <CTable>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col">#</CTableHeaderCell>
          <CTableHeaderCell scope="col">Class</CTableHeaderCell>
          <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow>
          <CTableHeaderCell scope="row">1</CTableHeaderCell>
          <CTableDataCell>Mark</CTableDataCell>
          <CTableDataCell>Otto</CTableDataCell>
          <CTableDataCell>@mdo</CTableDataCell>
        </CTableRow>
        <CTableRow>
          <CTableHeaderCell scope="row">2</CTableHeaderCell>
          <CTableDataCell>Jacob</CTableDataCell>
          <CTableDataCell>Thornton</CTableDataCell>
          <CTableDataCell>@fat</CTableDataCell>
        </CTableRow>
        <CTableRow>
          <CTableHeaderCell scope="row">3</CTableHeaderCell>
          <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
          <CTableDataCell>@twitter</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  )
}

export default CategoriesList
