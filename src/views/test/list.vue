<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <!-- prop : 排序字段  sortable : 开启排序  label : 展示  -->
      <el-table-column prop="id" sortable="custom" align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" :label="$t('table.title')">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag>
            <span>{{ row.status | statusFilter }}</span>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="时间">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="520px" align="center" label="备注">
        <template slot-scope="scope">
          <span>{{ scope.row.summary }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <!-- <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 创建和编辑 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <!-- <el-form-item :label="$t('table.type')" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item :label="$t('table.date')" prop="updateTime">
          <el-date-picker v-model="temp.updateTime" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item :label="$t('table.status')">
          <el-select v-model="statusOptions[temp.status]" class="filter-item" placeholder="Please select">
            <el-option v-for="(value, key) in statusOptions" :key="value" :label="value" :value="key" />
          </el-select>
        </el-form-item>
        <!--  <el-form-item :label="$t('table.importance')">
          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
        </el-form-item> -->
        <el-form-item label="备注" prop="summary">
          <el-input v-model="temp.summary" :autosize="{ minRows: 3, maxRows: 10}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, fetchCreate, fetchUpdate } from '@/api/test'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // waves directi
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const statusOptions = {
  0: 'No',
  1: 'Yes'
}

export default {
  name: 'List',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return statusOptions[status]
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
        updateTime: new Date(),
        title: '',
        summary: '',
        status: 1
      },
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      statusOptions: statusOptions,
      dialogFormVisible: false,
      rules: {
        summary: [{ required: true, message: 'summary is required', trigger: 'change' }],
        updateTime: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      listQuery: {
        sortbyStr: undefined,
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
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortByProp(prop, order)
    },
    sortByProp(prop, order) {
      if (order === 'ascending') {
        this.listQuery.sortbyStr = 't.' + prop + ' asc'
      } else if (order === 'descending') {
        this.listQuery.sortbyStr = 't.' + prop + ' desc'
      } else {
        this.listQuery.sortbyStr = undefined
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        updateTime: new Date(),
        title: '',
        summary: '',
        status: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.updateTime = +new Date(tempData.updateTime) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          fetchCreate(tempData).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.updateTime = new Date(this.temp.updateTime)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.updateTime = +new Date(tempData.updateTime) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          fetchUpdate(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
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
