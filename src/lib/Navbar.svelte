<script lang="ts">
  import logo from '../assets/logo.svg'

  let showDisclaimerModal = false
  let showErrorInfoModal = false
</script>

<div class="navbar mb-2 shadow-lg bg-neutral rounded-box">
  <div class="px-2 mx-2 min-h-inherit">
    <a class="min-h-inherit" href="https://github.com/Geomitron/Bridge">
      <img class="min-h-inherit p-2" src={logo} alt="Bridge" />
    </a>
  </div>
  <div class="flex-1 px-2 mx-2">
    <span class="text-2xl font-bold">
      Error Viewer
    </span>
  </div>
  <div class="link link-accent m-4" on:click="{ () => showErrorInfoModal = true }">How errors are generated</div>
  <div class="link link-accent m-4" on:click="{ () => showDisclaimerModal = true }">Disclaimers</div>
</div>

<div id="error-info-modal" class="modal" class:modal-open={showErrorInfoModal}>
  <div class="modal-box">
    <p></p>
    <div class="modal-action">
      <label for="error-info-modal" class="btn" on:click="{ () => showErrorInfoModal = false }">OK</label>
    </div>
  </div>
</div>

<div id="disclaimer-modal" class="modal" class:modal-open={showDisclaimerModal}>
  <div class="modal-box">
    <p></p>
    <div class="modal-action">
      <label for="disclaimer-modal" class="btn" on:click="{ () => showDisclaimerModal = false }">OK</label>
    </div>
  </div>
</div>

<style>
  .min-h-inherit {
    min-height: inherit;
  }
</style>