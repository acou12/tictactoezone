<div class="loading-indicator" />

<style lang="scss">
  .loading-indicator {
    position: fixed;
    top: 0px;
    left: 0px;
    height: 5px;
    background-color: blue;
    animation: load 5s ease-in-out both;
  }

  @keyframes load {
    0% {
      width: 0vw;
    }

    20% {
      width: 0vw;
    }

    100% {
      width: 100vw;
    }
  }
</style>
