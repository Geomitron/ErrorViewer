<!-- svelte-ignore unused-export-let -->
<script lang="ts">
  import { cloneDeep } from 'lodash'
  import { writable } from 'svelte/store'
  export let location: Location
  export let driveFolderID: string

  interface ErrorFile {
    sourceName: string
    usernameCounts: { [username: string]: number }
    chartErrors: SourceErrors
  }

  interface SourceErrors {
    [filesHash: string]: SourceItem
  }

  interface SourceItem {
    itemName: string
    folderID: string
    errors: { [errorID :string]: ChartError }
    warnings: { [warningID: string]: ChartError }
  }

  interface ChartError {
    name: string | null // Will be `null` if the error applies to the source item instead of the chart it contains.
    description: string
  }

  const errorTypes: { [errorType: string]: string[] } = {
    'Drive Folder Errors': ['driveError:inaccessibleFile', 'driveError:inaccessibleFolder', 'hostPermissions', 'onlyInChartPack'],
    'Missing File Errors': ['noMetadata', 'noChart', 'noAudio', 'noAlbumArt'],
    'Broken File Errors': ['badChart', 'badAlbum', 'badAudio'],
    'File Naming Errors': ['multipleIniFiles', 'invalidIni', 'multipleCharts', 'invalidChart', 'invalidAudio', 'invalidImage', 'multipleAlbums'],
    'Metadata Errors': ['invalidMetadata', 'invalidIniLine', 'missingMetadata', 'metadataFix'],
    'Chart File Errors': ['invalidChartLine', 'brokenNotes', 'noSections', 'noStarPower', 'nonzeroDelay', 'nonzeroOffset'],
    'Optimization Errors': ['driveError:extraFile', 'driveError:emptyFolder', 'emptyFolder', 'filesFolders', 'albumSize', 'extraFile', 'duplicate']
  }

  let viewedErrorTypes = Object.keys(errorTypes)
  $: viewedErrorIDs = Object.keys(errorTypes).flatMap(type => viewedErrorTypes.includes(type) ? errorTypes[type] : [])

  let showHiddenWarnings = false
  const hiddenWarnings = writable<string[]>(JSON.parse(localStorage.getItem('hiddenWarnings')) ?? [])
  hiddenWarnings.subscribe(val => localStorage.setItem('hiddenWarnings', JSON.stringify(val)))

  let errorFile: ErrorFile
  let chartErrorsView: SourceErrors

  getTableData()

  async function getTableData() {
    const results = await fetch(`http://bridge-db.net/api/error-list/${driveFolderID}`)
    errorFile = await results.json()
    updateTable()
  }

  function updateTable() {
    chartErrorsView = cloneDeep(errorFile.chartErrors)
    for (const filesHash in chartErrorsView) {

      // Remove hidden errors
      for (const errorID in chartErrorsView[filesHash].errors) {
        if (viewedErrorIDs.every(viewedErrorID => !errorID.startsWith(viewedErrorID))) {
          delete chartErrorsView[filesHash].errors[errorID]
        }
      }

      // Remove hidden warnings
      for (const warningID in chartErrorsView[filesHash].warnings) {
        if (!showHiddenWarnings && $hiddenWarnings.includes(`${filesHash}_${warningID}`)) {
          delete chartErrorsView[filesHash].warnings[warningID]
        }
      }
    }
  }
</script>
{#if errorFile}
  <div class="container mx-auto my-12 w-3/4 flex">
    <div class="form-control mx-auto">
      <div class="card bordered compact">
        <div class="card-body">
          <h2 class="card-title font-bold">{errorFile.sourceName}</h2>
          <table class="table w-full table-auto">
            <thead>
              <tr>
                <th class="!p-2">Charters in this source</th>
                <th class="!p-2 text-right">Visible error types</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="!p-2 !align-top">
                  <div class="flex flex-wrap gap-x-3">
                    {#each Object.entries(errorFile.usernameCounts) as [username, usernameCount] }
                      <span><span class="font-bold">{username}</span> ({usernameCount})</span>
                    {/each}
                  </div>
                </td>
                <td class="!p-2 !align-top">
                  <div class="flex flex-wrap justify-end gap-x-3">
                    {#each Object.keys(errorTypes) as errorType}
                      <label class="label cursor-pointer">
                        <span class="label-text mr-1">{ errorType }</span>
                        <input type="checkbox" value="{errorType}" bind:group={viewedErrorTypes} on:change="{updateTable}" class="checkbox checkbox-xs">
                      </label>
                    {/each}
                    <label class="label cursor-pointer">
                      <span class="label-text mr-1">Show Hidden Warnings</span>
                      <input type="checkbox" bind:checked={showHiddenWarnings} on:change="{updateTable}" class="checkbox checkbox-xs">
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
{/if}