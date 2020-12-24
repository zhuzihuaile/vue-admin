<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Date">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="520px" align="center" label="summary">
        <template slot-scope="scope">
          <span>{{ scope.row.summary }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" label="Title">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList } from '@/api/log'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // waves directi
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'List',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = ['no', 'yes']
      return statusMap[status]
    },
    parseTime: parseTime
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: '1'
      },
      listQuery: {
        page: 1,
        limit: 5
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter() {
      this.getList()
    },
    getList() {
      this.listLoading = true
      const _self = this
      return new Promise((resolve, reject) => {
        fetchList(_self.listQuery).then(response => {
          _self.list = response.data.items
          _self.total = response.data.total
          _self.listLoading = false
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(false)
        })
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
