<script lang="ts">
  import { Link } from 'svelte-routing'
  import { driveLink } from '../utils'
  import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
  import Fa from 'svelte-fa'

  type SearchType = 'sourceName' | 'charterName' | 'driveLink'
  interface SourceDataQueryResult {
    sourceName: string
    sourceDriveID: string
    charters: string[] // All charters that appear in the source, even if none of their charts generated errors.
  }

  let filterText = ''
  let searchType: SearchType = 'sourceName'

  let rows: SourceDataQueryResult[] = []
  let rowView: SourceDataQueryResult[] = []

  getTableData()

  async function getTableData() {
    const results = await fetch('http://bridge-db.net/api/error-list/sources-list')
    rows = await results.json()
    updateTable()
  }

  function updateTable() {
    rowView = rows.filter(row => {
      switch(searchType) {
        case 'sourceName': return row.sourceName.toLowerCase().includes(filterText.toLowerCase())
        case 'charterName': return row.charters.some(charter => filterText.toLowerCase().startsWith(charter.toLowerCase()))
        case 'driveLink': return filterText.includes(row.sourceDriveID)
      }
    })
  }
</script>

<div class="container mx-auto my-12 flex">
  <div class="form-control mx-auto w-1/2">
    <input type="text" bind:value="{filterText}" on:keyup="{updateTable}" class="input input-primary input-bordered" placeholder="Filter">
    <div class="flex flex-row-reverse">
      <label class="cursor-pointer label ml-2">
        <span class="label-text text-right mr-1">Drive Link</span>
        <input type="radio" bind:group={searchType} on:change="{updateTable}" class="radio-xs" value="driveLink">
      </label>
      <label class="cursor-pointer label ml-2">
        <span class="label-text text-right mr-1">Charter Name</span>
        <input type="radio" bind:group={searchType} on:change="{updateTable}" class="radio-xs" value="charterName">
      </label>
      <label class="cursor-pointer label ml-2">
        <span class="label-text text-right mr-1">Source Name</span>
        <input type="radio" bind:group={searchType} on:change="{updateTable}" class="radio-xs" value="sourceName">
      </label>
    </div>

    <table class="table w-full table-auto">
      <thead>
        <tr>
          <th>Source Name</th>
          <th class="text-right">Links</th>
        </tr>
      </thead>
      <tbody>
        {#each rowView as row}
          <tr class="hover:bg-gray-100">
            <td class="!bg-transparent !whitespace-normal !p-2">{row.sourceName}</td>
            <td class="!bg-transparent !whitespace-normal !p-2">
              <div class="flex flex-row-reverse gap-3">
                <a target="_blank" class="link mt-1.5" href="{driveLink(row.sourceDriveID)}"><Fa icon={faFolderOpen}/></a>
                <Link to="error-list/{row.sourceDriveID}" class="link link-accent align-middle">Errors</Link>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
