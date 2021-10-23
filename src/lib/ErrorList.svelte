<!-- svelte-ignore unused-export-let -->
<script lang="ts">
  import { cloneDeep, keys, values, entries } from 'lodash'
  import { driveLink } from '../utils'
  import { writable } from 'svelte/store'
  import { faFolderOpen, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
  import Fa from 'svelte-fa'
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
    inChartPack: boolean
    displayName: string // Calculated on the frontend
    errors: { [errorID :string]: ChartError }
    warnings: { [warningID: string]: ChartError }
  }

  interface ChartError {
    name: string | null // Will be `null` if the full chart name couldn't be determined (look at other names if possible)
    description: string
    referenceFolderLink?: string // Calculated on the frontend
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

  let viewedErrorTypes = keys(errorTypes)
  $: viewedErrorIDs = keys(errorTypes).flatMap(type => viewedErrorTypes.includes(type) ? errorTypes[type] : [])

  let showHiddenWarnings = false
  const hiddenWarnings = writable<string[]>(JSON.parse(localStorage.getItem(`hiddenWarnings_${driveFolderID}`)) ?? [])
  hiddenWarnings.subscribe(val => localStorage.setItem(`hiddenWarnings_${driveFolderID}`, JSON.stringify(val)))
  function hideWarning(filesHash: string, warningID: string) {
    hiddenWarnings.update(warnings => [...warnings, `${filesHash}_${warningID}`])
    updateTable()
  }
  function showWarning(filesHash: string, warningID: string) {
    hiddenWarnings.update(warnings => warnings.filter(warning => warning != `${filesHash}_${warningID}`))
    updateTable()
  }

  let errorFile: ErrorFile
  let chartErrorsView: SourceErrors

  let filteredCharter: string = null
  function filterCharter(username: string) {
    filteredCharter = filteredCharter == username ? null : username
    updateTable()
  }

  getTableData()

  async function getTableData() {
    const results = await fetch(`https://bridge-db.net/api/error-list/${driveFolderID}`)
    errorFile = await results.json()
    updateTable()
  }

  function updateTable() {
    chartErrorsView = cloneDeep(errorFile.chartErrors)
    for (const filesHash in chartErrorsView) {
      const sourceItem = chartErrorsView[filesHash]

      // Remove hidden errors
      for (const errorID in sourceItem.errors) {
        if (viewedErrorIDs.every(viewedErrorID => !errorID.startsWith(viewedErrorID))) {
          delete sourceItem.errors[errorID]
        }
      }

      // Remove hidden warnings
      for (const warningID in sourceItem.warnings) {
        if (!showHiddenWarnings && $hiddenWarnings.includes(`${filesHash}_${warningID}`)) {
          delete sourceItem.warnings[warningID]
        }
      }

      // Remove items with no errors left
      if (keys(sourceItem.errors).length + keys(sourceItem.warnings).length == 0) {
        delete chartErrorsView[filesHash]
        continue
      }

      // Set chartName
      const chartErrorWarnings = [...values(sourceItem.errors), ...values(sourceItem.warnings)]
      const chartErrorWarningNames = chartErrorWarnings.map(errorWarning => errorWarning.name).filter(Boolean)
      sourceItem.displayName = sourceItem.inChartPack || chartErrorWarningNames.length == 0 ? sourceItem.itemName : chartErrorWarningNames[0]

      // Remove items with non-filtered charters
      if (filteredCharter) {
        const [startIndex, endIndex] = [sourceItem.displayName.lastIndexOf('(') + 1, sourceItem.displayName.lastIndexOf(')')]
        const charters = sourceItem.displayName.substring(startIndex, endIndex)
        if (!filteredCharter.split('/').some(username => charters.includes(username))) {
          delete chartErrorsView[filesHash]
          continue
        }
      }

      // Parse "duplicate" links
      for (const errorID in sourceItem.errors) {
        const desc = sourceItem.errors[errorID].description
        if (desc.startsWith('There is another copy of this chart')) {
          sourceItem.errors[errorID].description = 'There is another copy of this chart '
          const [startIndex, endIndex] = [desc.lastIndexOf('[') + 1, desc.lastIndexOf(']')]
          sourceItem.errors[errorID].referenceFolderLink = desc.substring(startIndex, endIndex)
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
          <h2 class="card-title font-bold">
            <a target="_blank" class="link link-hover inline-block -mb-1 ml-1" href="{driveLink(driveFolderID)}">{errorFile.sourceName}</a>
          </h2>
          <table class="table w-full table-auto">
            <thead>
              <tr>
                <th class="!p-2">Charter{keys(errorFile.usernameCounts).length == 1 ? '' : 's'} in this source</th>
                <th class="!p-2 text-right">Visible error types</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="!p-2 !align-top">
                  <div class="flex flex-wrap gap-x-3">
                    {#each entries(errorFile.usernameCounts) as [username, usernameCount] }
                      <span class="link link-hover" class:underline="{username == filteredCharter}" on:click={() => filterCharter(username)}>
                        <span class="font-bold">{username}</span> ({usernameCount})
                      </span>
                    {/each}
                  </div>
                </td>
                <td class="!p-2 !align-top">
                  <div class="flex flex-wrap justify-end gap-x-3">
                    {#each keys(errorTypes) as errorType}
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
      {#if values(chartErrorsView).length == 0}
        <div class="alert alert-info text-center mt-16 mx-auto">No errors to display on this source</div>
      {/if}
      {#each entries(chartErrorsView) as [filesHash, sourceItem] }
        <div class="card compact bordered">
          <div class="card-body">
            <h2 class="card-title">
              {sourceItem.displayName}
              <a target="_blank" class="link inline-block -mb-1 ml-1" href="{driveLink(sourceItem.folderID)}"><Fa icon={faFolderOpen}/></a>
            </h2>
            {#each values(sourceItem.errors) as error}
              <div class="whitespace-pre-line">
                {#if sourceItem.inChartPack}{error.name}: {/if}{error.description}
                {#if error.referenceFolderLink}<a target="_blank" class="link" href="{error.referenceFolderLink}">here</a>.{/if}
              </div>
            {/each}
            {#if keys(sourceItem.errors).length > 0 && keys(sourceItem.warnings).length > 0}
              <div class="divider my-1"></div> 
            {/if}
            {#each entries(sourceItem.warnings) as [warningID, warning]}
              <div class="whitespace-pre-line">
                [Warning] {#if sourceItem.inChartPack}{warning.name}: {/if}{warning.description}
                {#if !$hiddenWarnings.includes(`${filesHash}_${warningID}`)}
                  <span data-tip="Hide" class="cursor-pointer tooltip" on:click={() => hideWarning(filesHash, warningID)}>
                    <Fa class="inline-block ml-1" icon={faEyeSlash}/>
                  </span>
                {:else}
                  <span data-tip="Show" class="cursor-pointer tooltip" on:click={() => showWarning(filesHash, warningID)}>
                    <Fa class="inline-block ml-1" icon={faEye}/>
                  </span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
