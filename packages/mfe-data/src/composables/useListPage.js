import { ref, reactive } from 'vue'

/**
 * Composable for standard list page logic: pagination, loading, data fetching.
 *
 * @param {object} options
 * @param {Function} options.apiList - API list function(params) => Promise
 * @param {Function} options.apiCount - API count function(params) => Promise
 * @param {Function} [options.mapRow] - Transform API row to table row
 * @param {string} [options.dataKey] - Key in response.data to extract rows (e.g. 'data')
 * @param {string} [options.countKey] - Key in count response.data (e.g. 'count')
 * @returns {object}
 */
export function useListPage({
  apiList,
  apiCount,
  mapRow = (row) => row,
  postFetch = null,
  dataKey = 'data',
  countKey = 'count',
}) {
  const rows = ref([])
  const totalCount = ref(0)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
    sortBy: null,
    descending: false,
  })

  // Extra filter params that the page can set (e.g. unit, tstart, tend)
  const filterParams = reactive({})

  /**
   * Build query params from pagination state and filters.
   */
  function buildParams() {
    const p = pagination.value
    const params = {
      offset: (p.page - 1) * p.rowsPerPage,
      limit: p.rowsPerPage,
    }
    if (p.sortBy) {
      params.sort = `${p.sortBy}:${p.descending ? 'desc' : 'asc'}`
    }
    // Merge extra filters (skip null/undefined/empty string)
    for (const [key, val] of Object.entries(filterParams)) {
      if (val !== null && val !== undefined && val !== '') {
        params[key] = val
      }
    }
    return params
  }

  /**
   * Fetch data from API. Called on mount and when pagination/filters change.
   */
  async function fetchData() {
    loading.value = true
    try {
      const params = buildParams()
      const [listRes, countRes] = await Promise.all([
        apiList(params),
        apiCount(params),
      ])
      rows.value = (listRes.data[dataKey] || []).map(mapRow)
      totalCount.value = countRes.data[dataKey]?.[countKey] || 0
      pagination.value.rowsNumber = totalCount.value
      if (postFetch) await postFetch(rows)
    } finally {
      loading.value = false
    }
  }

  /**
   * QTable @request handler for server-side pagination.
   */
  function onRequest(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    fetchData()
  }

  /**
   * Reset to page 1 and reload.
   */
  function refresh() {
    pagination.value.page = 1
    fetchData()
  }

  return {
    rows,
    totalCount,
    loading,
    pagination,
    filterParams,
    fetchData,
    onRequest,
    refresh,
  }
}
