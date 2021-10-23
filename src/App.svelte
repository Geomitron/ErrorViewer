<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Navbar from './lib/Navbar.svelte'
  import SourceList from './lib/SourceList.svelte'
  import ErrorList from './lib/ErrorList.svelte'

  export let url = ''
</script>

<main>

  <Navbar />

  <Router basepath="/ErrorViewer/dist" url="{url}">
    <div>
      <Route path='error-list/:driveFolderID' component="{ErrorList}" />
      <Route path='/' component="{SourceList}" />
    </div>
  </Router>

</main>
