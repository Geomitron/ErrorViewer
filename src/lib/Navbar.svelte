<script lang="ts">
  import logo from '../assets/logo.svg'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'
  import Fa from 'svelte-fa'

  let showInstructionsModal = false
  let showErrorInfoModal = false

  if (!localStorage.getItem(`instructions-viewed`)) {
    showInstructionsModal = true
    localStorage.setItem(`instructions-viewed`, 'true')
  }
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
  <div class="link link-accent m-4" on:click="{ () => showInstructionsModal = true }">Instructions for charters</div>
</div>

<div id="error-info-modal" class="modal" class:modal-open={showErrorInfoModal}>
  <div class="modal-box">
    <p></p>
    <div class="modal-action">
      <label for="error-info-modal" class="btn" on:click="{ () => showErrorInfoModal = false }">OK</label>
    </div>
  </div>
</div>

<div id="disclaimer-modal" class="modal" class:modal-open={showInstructionsModal}>
  <div class="modal-box !max-w-4xl">
    <h2 class="card-title">Instructions for charters (please read this)</h2>
    <div><strong>How to interpret each error in this list:</strong></div>
    <ul class="list-disc list-inside">
      <li>If you don't understand why it's listed here, <a class="link" target="_blank" href="https://docs.google.com/document/d/1XrLKnpL0xawaC90M4lLnhqhExwXM_3JpJnzNqlB_agM">this document</a> describes the formatting rules and guidelines.</li>
      <li>If you think it shouldn't be listed here, it's a bug or a mistake, so please let me know on Discord (Geo#8488) so I can fix it. <strong>(Fixing this is important; it's likely that another chart has incorrect metadata instead)</strong></li>
      <li>Warnings are probably not issues, but you should still read them to make sure. (hide them by clicking the <Fa class="inline-block mx-1 !align-middle" icon={faEyeSlash}/> icon)</li>
      <li>If you have charts in more than one source, errors for those charts will be divided across the different error lists.</li>
      <div class="divider"></div>
      <div><strong>Other things you should do:</strong></div>
      <li>On the main page, search for your charter name to see all the sources that include charts made by you.
        Let me know if there's a missing source or if your chart was put in a source without your permission.</li>
      <li> If you've made charts under different usernames/aliases, they should appear in the charter list grouped and separated by forward slashes.
        If that's not the case, let me know so I can fix it. (this lets Bridge show all your charts if someone searches by any of those usernames)</li>
    </ul>
    <br>
    <p>Note: Soon I will be releasing a program you can run to automatically fix "optimization errors". When it's done, I will replace this line with a link to it. (I'm hoping to finish it in the next week or two)</p>
    <div class="modal-action">
      <label for="disclaimer-modal" class="btn" on:click="{ () => showInstructionsModal = false }">OK</label>
    </div>
  </div>
</div>

<style>
  .min-h-inherit {
    min-height: inherit;
  }
</style>
