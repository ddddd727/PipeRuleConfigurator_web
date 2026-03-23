import axios from 'axios'

export const getLibraryTree = async () => {
  const { data } = await axios.get('/api/Library/tree')
  return data?.data ?? data ?? []
}

export const getCodelistTree = async () => {
  const { data } = await axios.get('/api/Library/codelist/tree')
  return data?.data ?? data ?? []
}

export const getComponentFullData = async (nodeLabel, category, filters = {}) => {
  const { data } = await axios.get('/api/Library/component/full-data', {
    params: {
      nodeLabel,
      category,
      ...filters
    }
  })
  return data?.data ?? data ?? {}
}

export const getCodelistTableData = async (nodeLabel) => {
  const { data } = await axios.get('/api/Library/codelist/table', {
    params: { nodeLabel }
  })
  return data?.data ?? data ?? []
}

export const disableRows = async (rows) => {
  const { data } = await axios.post('/api/Library/rows/disable', rows)
  return data?.data ?? data
}

export const enableRows = async (rows) => {
  const { data } = await axios.post('/api/Library/rows/enable', rows)
  return data?.data ?? data
}
