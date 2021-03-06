<template id="people-assinged">
  <div class="assignee pl-0 mb-5">
    <div class="colored">
      <div class="row m-0">
        <div class="col-8 bg-prime d-flex align-items-center">
          <h3 class="m-0 font-weight-bold text-white">People Assigned</h3>
        </div>
        <div class="col-4 bg-prime p-2">
          <b-form-input
            type="text"
            style="height: 32px"
            v-model="search"
            placeholder="Search"
          ></b-form-input>
          <i class="material-icons search-input-clear"
             v-if="search"
             @click="search = ''">clear</i>
        </div>
      </div>
    </div>
    <table class="assignee-list">
      <thead>
      <tr>
        <td class="tbl-sort" @click="sort('person')">
          <div class="d-flex align-items-center">
            <span>Person</span>
            <i class="material-icons" v-if="currentSort !== 'person'">unfold_more</i>
            <i class="material-icons" v-if="currentSort === 'person' && currentSortDir === 'asc'">expand_more</i>
            <i class="material-icons"
               v-if="currentSort === 'person' && currentSortDir === 'desc'">expand_less</i>
          </div>
        </td>
        <td class="tbl-sort" @click="sort('person_role')">
          <div class="d-flex align-items-center">
            <span>Role</span>
            <i class="material-icons" v-if="currentSort !== 'person_role'">unfold_more</i>
            <i class="material-icons" v-if="currentSort === 'person_role' && currentSortDir === 'asc'">expand_more</i>
            <i class="material-icons"
               v-if="currentSort === 'person_role' && currentSortDir === 'desc'">expand_less</i>
          </div>
        </td>
        <td v-if="permissions.includes('EDIT')">Action</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in peopleAssigned" v-bind:key="item.person_id">
        <td>{{item.person}}</td>
        <td>{{item.person_role}}</td>
        <td v-if="permissions.includes('EDIT')">
          <a @click="remove(index, item.person_id)" style="display: flex; align-items: center;">
            <i class="material-icons search-input-clear">clear</i>
            <span>Remove</span>
          </a>
        </td>
      </tr>
      </tbody>
    </table>
    <div class="wrap-pagination-add">
      <div class="pagination-wrap">
        <button class="cstm" @click="prevPage">&laquo;</button>
        <b-form-input
          type="text"
          :value="getPages()"
          name="url"
          readonly
          style="width: 68px;"
          class="input input-items mx-1"
        ></b-form-input>
        <b-select v-model="pageSize" placeholder="Items" style="width: 100px">
          <option :value="item.value"
                  v-for="item in paginationOptions"
                  :key="item.value">{{item.label}}
          </option>
        </b-select>
        <button @click="nextPage" class="mx-1 cstm">&raquo;</button>
      </div>
      <div class="add-new-record ml-3" v-if="permissions.includes('EDIT')">
        <div class="row m-0">
          <div class="col pr-0">
            <multiselect v-model="selectedPersonId"
                         :options="persons"
                         label="label"
                         placeholder="Person"
                         track-by="value">
            </multiselect>
          </div>
          <div class="col p-0">
            <div class="px-2">
              <multiselect v-model="selectedRole"
                           :options="people_assigned_roles"
                           placeholder="Role"
                           label="text"
                           track-by="text">
              </multiselect>
            </div>
          </div>
          <button class="add_btn cstm" @click="add()">+ Add</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import {restService} from '../plugins/axios';
  import {PEOPLE_ASSIGNED_ROLES} from '../const/constants.js';
  import sortBy from 'lodash.sortby';
  import Multiselect from 'vue-multiselect';
  import {authService} from '../services/auth-service';
  import {tableService} from '../services/table-service';
  import {apiService} from '../services/api-service';

  export default {
    name: 'people',
    template: '#people-assinged',
    props: {eventId: String},
    data: function () {
      let people_assigned_roles = PEOPLE_ASSIGNED_ROLES.map(item => ({
        value: item,
        text: item
      }));

      if (process.env.PEOPLE_ASSIGNED_ROLES) {
        people_assigned_roles = process.env.PEOPLE_ASSIGNED_ROLES.split(',').map(
          item => ({
            value: item.trim(),
            text: item.trim()
          })
        )
      }
      return {
        persons: [],
        allPersons: [],
        peopleAssigned: [],
        show: true,
        selectedPerson: '',
        selectedRole: '',
        selectedPersonId: '',
        currentSort: 'first_name',
        currentSortDir: 'asc',
        pageSize: 10,
        currentPage: 1,
        allPages: 1,
        paginationOptions: [],
        personsDict: [],
        tableName: 'people-assinged',
        search: '',
        people_assigned_roles,
        options2: [
          {value: '1', text: 'aa'},
          {value: '2', text: 'ab'},
          {value: '3', text: 'bc'},
          {value: '4', text: 'cd'},
          {value: '5', text: 'de'}
        ],
        item2: '',
        permissions: []
      }
    },
    created() {
      this.permissions = authService.getUserPermissions().admin;
      this.paginationOptions = [
        {label: '10', value: 10},
        {label: '25', value: 25},
        {label: '50', value: 50},
      ];
      this.pageSize = tableService.getTableSettings(this.tableName);
    },
    watch: {
      eventId: function (val) {
        if (val !== undefined) {
          this.fetchPeopleAssigned();
          this.fetchPersons();
        }
      },
      pageSize: function () {
        this.filtered();
        tableService.saveTableSettings(this.tableName, this.pageSize);
      },
      search: function () {
        this.filtered();
      }
    },
    methods: {
      getPages() {
        return `${this.currentPage}/${this.allPages}`
      },
      filtered: function () {
        let people;

        if (this.search) {
          people = this.allPersons.filter(tag => {
            const results = Object.values(tag).reduce((prev, val) => {
              if (typeof val === 'string' || typeof val === 'number') {
                const text = val.toString().toLowerCase();
                return [...prev, text.includes(this.search.toLowerCase())];
              }
            }, []);
            return results.some(e => !!e)
          })
        } else {
          people = this.allPersons;
        }

        people = people.sort((a, b) => {
          let modifier = 1;
          if (this.currentSortDir === 'desc') modifier = -1;
          if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if (a[this.currentSort] > b[this.currentSort]) return modifier;
          return 0
        });

        this.allPages = Math.ceil(people.length / this.pageSize);

        if (people.length < this.pageSize) {
          this.currentPage = 1;
        }

        if (this.currentPage > this.allPages) {
          this.currentPage = 1;
        }

        people = people.filter((event, index) => {
          let start = (this.currentPage - 1) * this.pageSize;
          let end = this.currentPage * this.pageSize;
          if (index >= start && index < end) return true
        });

        this.peopleAssigned = people;
      },
      fetchPersons: function () {
        const url = '/api/v3/persons/';

        restService
          .get(url)
          .then(response => {
            const data = response.data.map(person => ({value: person.person_id, label: `${person.first_name} ${person.last_name}`}));
            this.persons = sortBy(data, 'label');
          })
          .catch(error => {
            console.log(error);
            this.$toast.error(`Error: ${error}`)
          })
      },
      fetchPeopleAssigned: function () {
        apiService.getPeopleAssigned(this.eventId)
          .then(response => {
            this.allPersons = response.data;
            this.peopleAssigned = response.data;
            this.filtered();
            this.$emit('update', response.data);
          })
          .catch(err => {
            this.$toast.error(`Error: ${err}`)
          })
      },
      add: function (field_name) {
        const url = '/api/v3/eventpersons/';
        var data = {
          event_id: this.eventId,
          person_id: this.selectedPersonId.value,
          person_role: this.selectedRole.value
        };
        restService
          .post(url, data)
          .then(() => {
            this.$toast.success(`Added successfully`);
            this.fetchPeopleAssigned();
            this.selectedRole = '';
            this.selectedPersonId = '';
          })
          .catch(error => {
            console.log(error);
            this.$toast.error(`Error: ${error}`)
          })
      },
      remove: function (index, person_id) {
        const url = '/api/v3/eventpersons/';
        var data = {
          event_id: this.eventId,
          person_id: person_id
        };
        restService
          .delete(url, {data})
          .then(() => {
            this.peopleAssigned.splice(index, 1);
            this.$toast.success(`Deleted successfully`);
          })
          .catch(error => {
            console.log(error);
            this.$toast.error(`Error: ${error}`)
          })
      },
      sort: function (s) {
        if (s === this.currentSort) {
          this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc'
        }
        this.currentSort = s;
        this.filtered();
      },
      nextPage: function () {
        if (this.currentPage * this.pageSize < this.persons.length) {
          this.currentPage++;
          this.filtered();
        }
      },
      prevPage: function () {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.filtered();
        }
      }
    },
    components: {
      Multiselect
    }
  }
</script>
