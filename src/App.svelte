<script lang="ts" context="module">
  /** Defined in `vite.config.js` */
  declare const viteDefine_basePath: string
</script>
<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Navbar from './lib/Navbar.svelte'
  import SourceList from './lib/SourceList.svelte'
  import ErrorList from './lib/ErrorList.svelte'

  export let url = ''
  const basePath = viteDefine_basePath
</script>

<main>

  <Navbar />

  <Router basepath="{basePath}" url="{url}">
    <div>
      <Route path='error-list/:driveFolderID' component="{ErrorList}" />
      <Route path='/' component="{SourceList}" />
    </div>
  </Router>

</main>
