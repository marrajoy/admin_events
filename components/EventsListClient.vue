<template>
  <div class="events-list-client">
    <table border="1">
      <thead>
      <tr>
        <!--
        <th class="tbl-sort" @click="sort('contact')">
          Contact
                      <i class="material-icons">expand_more</i>

        </th>
        -->
        <th class="tbl-sort" @click="sort('event_name')">
          Event Name
          <i class="material-icons">expand_more</i>
        </th>
        <th class="tbl-sort" @click="sort('event_start')">
          Event Date
          <i class="material-icons">expand_more</i>

        </th>
        <th class="tbl-sort" @click="sort('updated')">
          Last Updated
          <i class="material-icons">expand_more</i>

        </th>
        <th class="tbl-sort" @click="sort('client_status')">
          Client Status
          <i class="material-icons">expand_more</i>

        </th>
        <th>Par.#</th>
        <th>Pres.#</th>
        <th style="min-width: 170px;">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr class="sub" v-for="event in sortedEvents" v-bind:key="event.event_code">
        <td>{{ event.event_name }}</td>
        <td>{{ event.event_start }}</td>
        <td>{{ event.updated }}</td>
        <td>{{ event.client_status }}</td>
        <td>3</td>
        <td>2</td>
        <td>
          <router-link :to="'client/events/' + event.event_id">
            <button class="cstm">Edit</button>
          </router-link>
        </td>
      </tr>
      </tbody>
    </table>
    <button class="cstm" @click="prevPage">&laquo;</button>
    <button class="cstm" @click="nextPage">&raquo;</button>
  </div>
</template>

<script>
  import {restService} from '../plugins/axios';

  export default {
    name: 'EventsListClient',
    props: {events: Array, fetchEvents: Function},
    data() {
      return {
        currentSort: 'event_code',
        currentSortDir: 'asc',
        pageSize: 9,
        currentPage: 1,
        search: ''
      }
    },
    methods: {
      sort: function (s) {
        //if s == current sort, reverse
        if (s === this.currentSort) {
          this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc'
        }
        this.currentSort = s
      },
      nextPage: function () {
        if (this.currentPage * this.pageSize < this.events.length)
          this.currentPage++
      },
      prevPage: function () {
        if (this.currentPage > 1) this.currentPage--
      },

      clone: function (event_id) {

        const url = '/api/v3/events/'
        var data = {
          event_id: event_id,
          clone: 'True'
        }

        restService.post(url, data)
          .then(response => {
            this.$router.push(`/events/${response.data.event_id}`)
          })
          .catch(function (error) {
            console.log(error);
            this.$toast.error(`Error fetching event: ${error}`)
          })
          .then(function () {
            // always executed even with catched errors
          })
      }
    },
    computed: {
      sortedEvents: function () {
        return this.events
          .sort((a, b) => {
            let modifier = 1
            if (this.currentSortDir === 'desc') modifier = -1
            if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier
            if (a[this.currentSort] > b[this.currentSort]) return 1 * modifier
            return 0
          })
          .filter((event, index) => {
            let start = (this.currentPage - 1) * this.pageSize
            let end = this.currentPage * this.pageSize
            if (index >= start && index < end) return true
          })
      }
    }
  }
</script>
